use std::collections::HashMap;
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::Mutex;
use std::time::SystemTime;

use parcel_plugin::{
  Asset, AssetFlags, BuildMode, Config, DependencyFlags, DependencyOptions, Diagnostic, ImportType,
  LogLevel, Options, Plugin, SpecifierType, register_plugin,
};
use serde::{Deserialize, Serialize};

const PACKAGE_NAME: &str = "@cumulo/parcel-plugin";
const CSS_PIPELINE: &str = "cumulo-css";
const IPC_PREFIX: &str = "__CUMULO_PARCEL_IPC__";
const WORKER_ENV_VAR: &str = "CUMULO_PARCEL_WORKER";

const ALLOWED_EXTENSIONS: &[&str] = &[".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const SKIPPED_CUMULO_PACKAGES: &[&str] = &[
  "node_modules/@cumulo/css/",
  "node_modules/@cumulo/parcel-plugin/",
  "node_modules/@cumulo/parcel-transformer/",
  "node_modules/@cumulo/unplugin/",
];
const CONTENT_TRIGGERS: &[&str] = &[
  "@cumulo/css",
  "recipe(",
  "style(",
  "create(",
  "keyframes(",
  "createTheme(",
  "createThemeContract(",
];

#[derive(Debug, Default, Clone, Deserialize)]
struct PluginConfig {
  #[serde(default)]
  include: Vec<String>,
  #[serde(default)]
  exclude: Vec<String>,
}

#[derive(Debug, Default, Clone, Deserialize)]
struct PackageJson {
  #[serde(rename = "@cumulo/parcel-plugin")]
  plugin_config: Option<PluginConfig>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ExtractRequest<'a> {
  file_path: &'a str,
  code: &'a str,
  project_root: &'a str,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExtractResponse {
  css: String,
  code: Option<String>,
  #[serde(default)]
  dependencies: Vec<String>,
  warning: Option<String>,
}

#[derive(Debug, Clone)]
struct CachedExtraction {
  response: ExtractResponse,
  dep_stamps: Vec<(PathBuf, Option<(SystemTime, u64)>)>,
}

struct ExtractorWorker {
  child: Child,
  stdin: ChildStdin,
  stdout: BufReader<ChildStdout>,
}

impl ExtractorWorker {
  fn spawn(worker_path: &Path, project_root: &Path) -> Result<Self, String> {
    let mut child = Command::new("node")
      .arg(worker_path)
      .arg("--project-root")
      .arg(project_root)
      .current_dir(project_root)
      .stdin(Stdio::piped())
      .stdout(Stdio::piped())
      .stderr(Stdio::inherit())
      .spawn()
      .map_err(|err| {
        format!(
          "Failed to spawn {PACKAGE_NAME} Node worker at {}: {err}",
          worker_path.display()
        )
      })?;

    let stdin = child
      .stdin
      .take()
      .ok_or_else(|| format!("Failed to open stdin for {PACKAGE_NAME} worker"))?;
    let stdout = child
      .stdout
      .take()
      .ok_or_else(|| format!("Failed to open stdout for {PACKAGE_NAME} worker"))?;

    Ok(Self {
      child,
      stdin,
      stdout: BufReader::new(stdout),
    })
  }

  fn extract(
    &mut self,
    file_path: &Path,
    code: &str,
    project_root: &Path,
  ) -> Result<ExtractResponse, String> {
    let file_path_str = file_path.to_string_lossy();
    let project_root_str = project_root.to_string_lossy();

    let request = ExtractRequest {
      file_path: &file_path_str,
      code,
      project_root: &project_root_str,
    };

    let payload = serde_json::to_string(&request)
      .map_err(|err| format!("Failed to serialize extraction request: {err}"))?;

    self
      .stdin
      .write_all(payload.as_bytes())
      .and_then(|_| self.stdin.write_all(b"\n"))
      .and_then(|_| self.stdin.flush())
      .map_err(|err| format!("Failed to write request to {PACKAGE_NAME} worker: {err}"))?;

    let mut line = String::new();
    loop {
      line.clear();
      let bytes = self
        .stdout
        .read_line(&mut line)
        .map_err(|err| format!("Failed to read response from {PACKAGE_NAME} worker: {err}"))?;

      if bytes == 0 {
        return Err(format!("{PACKAGE_NAME} worker closed unexpectedly"));
      }

      let trimmed = line.trim_end_matches(&['\r', '\n'][..]);
      if let Some(json_str) = trimmed.strip_prefix(IPC_PREFIX) {
        return serde_json::from_str::<ExtractResponse>(json_str)
          .map_err(|err| format!("Invalid response from {PACKAGE_NAME} worker: {err}"));
      }
    }
  }
}

impl Drop for ExtractorWorker {
  fn drop(&mut self) {
    let _ = self.child.kill();
    let _ = self.child.wait();
  }
}

pub struct CumuloPlugin {
  config: PluginConfig,
  project_root: PathBuf,
  config_dir: Option<PathBuf>,
  worker: Mutex<Option<ExtractorWorker>>,
  cache: Mutex<HashMap<(PathBuf, u64), CachedExtraction>>,
}

impl CumuloPlugin {
  fn resolve_config(config: &Config, options: &Options) -> Result<Self, Diagnostic> {
    let inline = if config.bytes().is_empty() {
      PluginConfig::default()
    } else {
      serde_json::from_slice::<PluginConfig>(config.bytes())
        .map_err(|err| Diagnostic::new(format!("Invalid {PACKAGE_NAME} configuration: {err}")))?
    };

    let config_dir = config
      .path()
      .parent()
      .filter(|p| !p.as_os_str().is_empty())
      .map(Path::to_path_buf);

    let project_root = options.project_root();

    let pkg_config = config_dir
      .as_deref()
      .and_then(|dir| load_package_json(&dir.join("package.json"), options))
      .or_else(|| load_package_json(&project_root.join("package.json"), options))
      .and_then(|pkg| pkg.plugin_config)
      .unwrap_or_default();

    let merged = PluginConfig {
      include: if !inline.include.is_empty() {
        inline.include
      } else {
        pkg_config.include
      },
      exclude: if !inline.exclude.is_empty() {
        inline.exclude
      } else {
        pkg_config.exclude
      },
    };

    Ok(Self {
      config: merged,
      project_root,
      config_dir,
      worker: Mutex::new(None),
      cache: Mutex::new(HashMap::new()),
    })
  }

  fn run_extraction(
    &self,
    file_path: &Path,
    code: &str,
    options: &Options,
  ) -> Result<ExtractResponse, Diagnostic> {
    let worker_path = find_worker_script(
      file_path,
      self.config_dir.as_deref(),
      &self.project_root,
      options,
    )
    .ok_or_else(|| {
      Diagnostic::new(format!(
        "Could not locate {PACKAGE_NAME} extractor worker (dist/worker.mjs) from \"{}\" or \"{}\".",
        file_path.display(),
        self.project_root.display()
      ))
      .with_hint(format!(
        "Ensure {PACKAGE_NAME} is installed and built (packages/parcel-plugin/dist/worker.mjs)."
      ))
    })?;

    let mut guard = self
      .worker
      .lock()
      .map_err(|_| Diagnostic::new(format!("Failed to acquire {PACKAGE_NAME} worker lock")))?;

    for attempt in 0..2 {
      if guard.is_none() {
        let spawned = ExtractorWorker::spawn(&worker_path, &self.project_root)
          .map_err(Diagnostic::new)?;
        *guard = Some(spawned);
      }

      if let Some(worker) = guard.as_mut() {
        match worker.extract(file_path, code, &self.project_root) {
          Ok(response) => return Ok(response),
          Err(err) => {
            *guard = None;
            if attempt == 1 {
              return Err(Diagnostic::new(err));
            }
          }
        }
      }
    }

    Err(Diagnostic::new(format!(
      "{PACKAGE_NAME} extraction failed after restarting worker"
    )))
  }

  fn extract_pass1(
    &self,
    file_path: &Path,
    code: &str,
    options: &Options,
  ) -> Result<ExtractResponse, Diagnostic> {
    let response = self.run_extraction(file_path, code, options)?;
    let dep_stamps = collect_dep_stamps(&response.dependencies);
    let key = (file_path.to_path_buf(), hash_str(code));

    if let Ok(mut cache) = self.cache.lock() {
      cache.insert(
        key,
        CachedExtraction {
          response: response.clone(),
          dep_stamps,
        },
      );
    }

    Ok(response)
  }

  fn extract_cached(
    &self,
    file_path: &Path,
    code: &str,
    options: &Options,
  ) -> Result<ExtractResponse, Diagnostic> {
    let key = (file_path.to_path_buf(), hash_str(code));

    if let Ok(cache) = self.cache.lock()
      && let Some(entry) = cache.get(&key)
      && dep_stamps_match(&entry.dep_stamps)
    {
      return Ok(entry.response.clone());
    }

    self.extract_pass1(file_path, code, options)
  }
}

impl Plugin for CumuloPlugin {
  fn new(config: &Config, options: &Options) -> Result<Self, Diagnostic> {
    Self::resolve_config(config, options)
  }

  fn transform(&self, asset: &mut Asset, options: &Options) -> Result<(), Diagnostic> {
    let file_path = asset.file_path();

    // Pass 2: Extract CSS and convert this virtual pipeline asset into CSS in place.
    if asset.pipeline().as_deref() == Some(CSS_PIPELINE) {
      let code = asset.content()?;
      let result = self.extract_cached(&file_path, &code, options)?;

      track_dependencies(&result.dependencies, options);
      maybe_log_warning(result.warning.as_deref(), options);

      asset.set_type("css");
      asset.set_pipeline(None);
      asset.set_flags(asset.flags() | AssetFlags::SIDE_EFFECTS);
      asset.set_content(&result.css);
      return Ok(());
    }

    // Only intercept normal (un-pipelined) JS/TS assets on Pass 1.
    if asset.pipeline().is_some() {
      return Ok(());
    }

    if !is_candidate_path(&file_path, &self.config) {
      return Ok(());
    }

    let asset_content = asset.content()?;
    let disk_source = options.read_to_string(&file_path).ok();
    let is_post_js = asset.dependency_count() > 0
      || disk_source.as_deref().is_some_and(|raw| {
        raw != asset_content && !should_process_file(&asset_content, &file_path, &self.config)
      });

    // Read the original source from disk when running after Parcel's JS transformer
    // so Pass 1a, Pass 1b, and Pass 2 share the exact same cache key.
    let source = if is_post_js {
      disk_source.unwrap_or(asset_content)
    } else {
      asset_content
    };

    if !should_process_file(&source, &file_path, &self.config) {
      return Ok(());
    }

    let result = self.extract_cached(&file_path, &source, options)?;
    track_dependencies(&result.dependencies, options);
    maybe_log_warning(result.warning.as_deref(), options);

    let has_css = !result.css.trim().is_empty();
    let Some(file_name) = file_path.file_name().and_then(|name| name.to_str()) else {
      return Ok(());
    };

    if !is_post_js {
      if let Some(rewritten) = result.code {
        let has_remaining_imports = rewritten.contains("import ") || rewritten.contains("import{");
        asset.set_content(&rewritten);
        // If no JS imports remain (e.g. a file with only createGlobalStyles), Parcel's JS
        // transformer won't add any dependencies, so attach the stylesheet right here.
        if has_css && !has_remaining_imports {
          add_css_dependency(asset, file_name)?;
        }
        return Ok(());
      }

      // If rewriting was skipped and the user did not configure a post-JS pass,
      // attach the stylesheet dependency directly if there are no imports to conflict with.
      if has_css && !source.contains("import ") && !source.contains("import{") {
        add_css_dependency(asset, file_name)?;
      }
      return Ok(());
    }

    if !has_css {
      return Ok(());
    }

    // Avoid duplicating the dependency if Pass 1a already attached it.
    let expected_specifier = format!("{CSS_PIPELINE}:./{file_name}");
    if asset
      .dependencies()
      .any(|dep| dep.specifier() == expected_specifier)
    {
      return Ok(());
    }

    add_css_dependency(asset, file_name)?;
    Ok(())
  }
}

fn add_css_dependency(asset: &mut Asset, file_name: &str) -> Result<(), Diagnostic> {
  asset.add_dependency(
    DependencyOptions::new(format!("{CSS_PIPELINE}:./{file_name}"))
      .specifier_type(SpecifierType::Esm)
      .import_type(ImportType::StyleSheet)
      .flags(DependencyFlags::SIDE_EFFECTS),
  )
}

register_plugin!(CumuloPlugin);

fn load_package_json(path: &Path, options: &Options) -> Option<PackageJson> {
  let content = options.read_to_string(path).ok()?;
  serde_json::from_str(&content).ok()
}

fn track_dependencies(dependencies: &[String], options: &Options) {
  for dep in dependencies {
    let dep_path = Path::new(dep);
    if dep_path.is_absolute() {
      let _ = options.read_file(dep_path);
    }
  }
}

fn maybe_log_warning(warning: Option<&str>, options: &Options) {
  let Some(message) = warning else {
    return;
  };
  let should_log =
    options.mode() == BuildMode::Development || options.env("DEBUG_CUMULO").is_some();
  if should_log {
    options.log(LogLevel::Warn, format!("[{PACKAGE_NAME}] {message}"));
  }
}

fn normalize_path_str(path: &Path) -> String {
  path.to_string_lossy().replace('\\', "/")
}

fn matches_any_pattern(id: &str, patterns: &[String]) -> bool {
  patterns.iter().any(|pattern| !pattern.is_empty() && id.contains(pattern.as_str()))
}

fn has_allowed_extension(id: &str) -> bool {
  let lower = id.to_ascii_lowercase();
  ALLOWED_EXTENSIONS.iter().any(|ext| lower.ends_with(ext))
}

fn is_candidate_path(file_path: &Path, config: &PluginConfig) -> bool {
  let id = normalize_path_str(file_path);
  if id.is_empty() {
    return false;
  }
  if matches_any_pattern(&id, &config.exclude) {
    return false;
  }
  if matches_any_pattern(&id, &config.include) {
    return true;
  }
  if id.starts_with('\0') || id.contains('\0') {
    return false;
  }
  if id.contains("node_modules") {
    if !id.contains("@cumulo") {
      return false;
    }
    if SKIPPED_CUMULO_PACKAGES.iter().any(|pkg| id.contains(pkg)) {
      return false;
    }
  }
  if id.ends_with(".cumulo.css") || id.contains("virtual:cumulo") {
    return false;
  }
  has_allowed_extension(&id)
}

fn should_process_file(code: &str, file_path: &Path, config: &PluginConfig) -> bool {
  if code.is_empty() {
    return false;
  }
  let id = normalize_path_str(file_path);
  if id.is_empty() {
    return false;
  }
  if matches_any_pattern(&id, &config.exclude) {
    return false;
  }
  if matches_any_pattern(&id, &config.include) {
    return true;
  }
  if !is_candidate_path(file_path, config) {
    return false;
  }
  CONTENT_TRIGGERS.iter().any(|trigger| code.contains(trigger))
}

fn hash_str(value: &str) -> u64 {
  let mut hasher = DefaultHasher::new();
  value.hash(&mut hasher);
  hasher.finish()
}

fn file_stamp(path: &Path) -> Option<(SystemTime, u64)> {
  let meta = fs::metadata(path).ok()?;
  let modified = meta.modified().ok()?;
  Some((modified, meta.len()))
}

fn collect_dep_stamps(dependencies: &[String]) -> Vec<(PathBuf, Option<(SystemTime, u64)>)> {
  dependencies
    .iter()
    .map(|dep| {
      let path = PathBuf::from(dep);
      let stamp = file_stamp(&path);
      (path, stamp)
    })
    .collect()
}

fn dep_stamps_match(stamps: &[(PathBuf, Option<(SystemTime, u64)>)]) -> bool {
  stamps
    .iter()
    .all(|(path, expected)| file_stamp(path) == *expected)
}

fn find_worker_script(
  asset_path: &Path,
  config_dir: Option<&Path>,
  project_root: &Path,
  options: &Options,
) -> Option<PathBuf> {
  if let Some(env_path) = options
    .env(WORKER_ENV_VAR)
    .or_else(|| std::env::var(WORKER_ENV_VAR).ok())
  {
    let candidate = PathBuf::from(env_path);
    if candidate.is_file() {
      return Some(candidate);
    }
  }

  let rel_node_modules = Path::new("node_modules/@cumulo/parcel-plugin/dist/worker.mjs");
  let rel_workspace = Path::new("packages/parcel-plugin/dist/worker.mjs");

  let cwd = std::env::current_dir().ok();
  let mut roots: Vec<&Path> = Vec::new();
  if let Some(parent) = asset_path.parent() {
    roots.push(parent);
  }
  if let Some(dir) = config_dir {
    roots.push(dir);
  }
  roots.push(project_root);
  if let Some(ref dir) = cwd {
    roots.push(dir.as_path());
  }

  for root in &roots {
    for ancestor in root.ancestors() {
      let candidate = ancestor.join(rel_node_modules);
      if candidate.is_file() {
        return Some(candidate);
      }
    }
  }

  for root in &roots {
    for ancestor in root.ancestors() {
      let candidate = ancestor.join(rel_workspace);
      if candidate.is_file() {
        return Some(candidate);
      }
    }
  }

  None
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::time::UNIX_EPOCH;

  #[test]
  fn test_should_process_file_filters_correctly() {
    let config = PluginConfig::default();

    assert!(should_process_file(
      "import { style } from '@cumulo/css';\nexport const box = style({ padding: 8 });",
      Path::new("/app/src/Card.tsx"),
      &config
    ));
    assert!(should_process_file(
      "export const btn = recipe({ base: {} });",
      Path::new("/app/node_modules/@cumulo/core/dist/components/Button.mjs"),
      &config
    ));
    assert!(!should_process_file(
      "export const btn = recipe({ base: {} });",
      Path::new("/app/node_modules/some-other-pkg/index.js"),
      &config
    ));
    assert!(!should_process_file(
      "export function style(rule) {}",
      Path::new("/app/node_modules/@cumulo/css/dist/create.mjs"),
      &config
    ));
    assert!(!should_process_file(
      "export const x = 42;",
      Path::new("/app/src/utils.ts"),
      &config
    ));
    assert!(!should_process_file(
      "import { style } from '@cumulo/css';",
      Path::new("/app/src/styles.css"),
      &config
    ));
    assert!(!should_process_file(
      "import { style } from '@cumulo/css';",
      Path::new("/app/src/Card.tsx.cumulo.css"),
      &config
    ));
  }

  #[test]
  fn test_include_and_exclude_patterns() {
    let config = PluginConfig {
      include: vec!["custom-styles".to_owned()],
      exclude: vec!["ignored.tsx".to_owned()],
    };

    assert!(!should_process_file(
      "import { style } from '@cumulo/css';",
      Path::new("/app/src/ignored.tsx"),
      &config
    ));
    assert!(should_process_file(
      "export const x = 1;",
      Path::new("/app/src/custom-styles.ts"),
      &config
    ));
  }

  #[test]
  fn test_windows_path_normalization() {
    let config = PluginConfig::default();
    assert!(should_process_file(
      "import { style } from '@cumulo/css';",
      Path::new(r"C:\repo\node_modules\@cumulo\core\dist\Button.js"),
      &config
    ));
    assert!(!should_process_file(
      "import { style } from '@cumulo/css';",
      Path::new(r"C:\repo\node_modules\react\index.js"),
      &config
    ));
  }

  #[test]
  fn test_dep_stamps_detect_modification() {
    let unique = SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .unwrap_or_default()
      .as_nanos();
    let dir = std::env::temp_dir().join(format!("cumulo-parcel-plugin-stamp-{unique}"));
    let file = dir.join("tokens.ts");
    fs::create_dir_all(&dir).unwrap();
    fs::write(&file, "export const color = 'red';\n").unwrap();

    let stamps = collect_dep_stamps(&[file.to_string_lossy().into_owned()]);
    assert!(dep_stamps_match(&stamps));

    fs::write(&file, "export const color = 'blue'; // changed length\n").unwrap();
    assert!(!dep_stamps_match(&stamps));

    let _ = fs::remove_dir_all(&dir);
  }
}
