use keyring::Entry;

const SERVICE_NAME: &str = "com.taureact.app";

fn get_entry(key: &str) -> Result<Entry, String> {
    Entry::new(SERVICE_NAME, key).map_err(|e| format!("Keyring error: {}", e))
}

/// Store a secret in the OS keychain.
#[tauri::command]
pub fn secure_set(key: String, value: String) -> Result<(), String> {
    let entry = get_entry(&key)?;
    entry
        .set_password(&value)
        .map_err(|e| format!("Failed to store secret '{}': {}", key, e))
}

/// Retrieve a secret from the OS keychain.
/// Returns None if the key doesn't exist.
#[tauri::command]
pub fn secure_get(key: String) -> Result<Option<String>, String> {
    let entry = get_entry(&key)?;
    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Failed to read secret '{}': {}", key, e)),
    }
}

/// Delete a secret from the OS keychain.
#[tauri::command]
pub fn secure_delete(key: String) -> Result<(), String> {
    let entry = get_entry(&key)?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()), // Already gone
        Err(e) => Err(format!("Failed to delete secret '{}': {}", key, e)),
    }
}
