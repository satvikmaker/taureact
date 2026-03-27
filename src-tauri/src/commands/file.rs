use serde::Serialize;
use tauri::ipc::Response;
use std::fs;
use std::path::{Component, Path};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadata {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_directory: bool,
    pub is_file: bool,
    pub modified: Option<u64>,
    pub created: Option<u64>,
}

fn system_time_to_millis(time: std::io::Result<std::time::SystemTime>) -> Option<u64> {
    time.ok()?
        .duration_since(std::time::UNIX_EPOCH)
        .ok()
        .map(|d| d.as_millis() as u64)
}

/// Reject paths that contain parent-directory traversal components.
fn validate_path(path: &Path) -> Result<(), String> {
    for component in path.components() {
        if let Component::ParentDir = component {
            return Err(format!(
                "Path traversal not allowed: {}",
                path.display()
            ));
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_file_metadata(paths: Vec<String>) -> Result<Vec<FileMetadata>, String> {
    let mut results = Vec::with_capacity(paths.len());

    for path_str in &paths {
        let path = Path::new(path_str);
        validate_path(path)?;

        let metadata = fs::metadata(path)
            .map_err(|e| format!("Failed to read {}: {}", path_str, e))?;

        results.push(FileMetadata {
            name: path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default(),
            path: path_str.clone(),
            size: metadata.len(),
            is_directory: metadata.is_dir(),
            is_file: metadata.is_file(),
            modified: system_time_to_millis(metadata.modified()),
            created: system_time_to_millis(metadata.created()),
        });
    }

    Ok(results)
}

/// Read a file and return its raw bytes via Tauri's binary IPC.
/// Used for image previews — avoids asset protocol scope configuration.
#[tauri::command]
pub fn read_file_bytes(path: String) -> Result<Response, String> {
    let p = Path::new(&path);
    validate_path(p)?;
    let bytes = fs::read(p).map_err(|e| format!("Failed to read {}: {}", path, e))?;
    Ok(Response::new(bytes))
}
