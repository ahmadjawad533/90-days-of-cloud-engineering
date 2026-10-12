#!/usr/bin/env bash
# ==============================================================================
# Script Name : backup.sh
# Description : Automated directory backup with rotation, logging, and error handling
# Usage        : ./backup.sh <source_directory> <destination_directory> [retention_count]
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Configuration Defaults
# ------------------------------------------------------------------------------
DEFAULT_RETENTION=5
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
LOG_FILE=""

# ------------------------------------------------------------------------------
# Logging Functions
# ------------------------------------------------------------------------------
log() {
    local level="$1"
    local message="$2"
    local timestamp
    timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    local log_entry="[${timestamp}] [${level}] ${message}"

    # Print to console (stdout for INFO/WARN, stderr for ERROR)
    if [[ "${level}" == "ERROR" ]]; then
        echo "${log_entry}" >&2
    else
        echo "${log_entry}"
    fi

    # Append to log file if destination log file is initialized
    if [[ -n "${LOG_FILE}" ]] && [[ -d "$(dirname "${LOG_FILE}")" ]]; then
        echo "${log_entry}" >> "${LOG_FILE}"
    fi
}

log_info() {
    log "INFO" "$1"
}

log_warn() {
    log "WARN" "$1"
}

log_error() {
    log "ERROR" "$1"
}

# ------------------------------------------------------------------------------
# Usage & Help
# ------------------------------------------------------------------------------
usage() {
    cat << EOF
Usage: $(basename "$0") <source_directory> <destination_directory> [retention_count]

Arguments:
  source_directory       Directory to back up (must exist and be readable)
  destination_directory  Directory where archives and logs will be stored
  retention_count        Number of recent backups to keep (optional, default: ${DEFAULT_RETENTION})

Options:
  -h, --help             Show this help message and exit

Example:
  $(basename "$0") /var/www/html /mnt/backups/web 5
EOF
}

# ------------------------------------------------------------------------------
# Argument Parsing and Validation
# ------------------------------------------------------------------------------
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

if [[ $# -lt 2 ]]; then
    log_error "Missing required arguments."
    usage >&2
    exit 1
fi

SOURCE_DIR="$1"
DEST_DIR="$2"
RETENTION="${3:-$DEFAULT_RETENTION}"

# Validate Retention is a positive integer
if ! [[ "${RETENTION}" =~ ^[1-9][0-9]*$ ]]; then
    log_error "Retention count must be a positive integer. Received: '${RETENTION}'"
    exit 1
fi

# Validate Source Directory exists and is readable
if [[ ! -d "${SOURCE_DIR}" ]]; then
    log_error "Source directory '${SOURCE_DIR}' does not exist or is not a directory."
    exit 1
fi

if [[ ! -r "${SOURCE_DIR}" ]]; then
    log_error "Source directory '${SOURCE_DIR}' is not readable. Check permissions."
    exit 1
fi

# Ensure Destination Directory exists
if [[ ! -d "${DEST_DIR}" ]]; then
    log_info "Destination directory '${DEST_DIR}' does not exist. Creating it now..."
    mkdir -p "${DEST_DIR}" || {
        log_error "Failed to create destination directory '${DEST_DIR}'."
        exit 1
    }
fi

# Initialize Log File in Destination Directory
LOG_FILE="${DEST_DIR}/backup.log"
touch "${LOG_FILE}" || {
    log_error "Cannot write to log file at '${LOG_FILE}'. Check destination permissions."
    exit 1
}

# ------------------------------------------------------------------------------
# Temporary Directory and Trap Cleanup
# ------------------------------------------------------------------------------
TEMP_WORK_DIR=$(mktemp -d /tmp/backup_work_XXXXXX)

cleanup() {
    local exit_code=$?
    if [[ -d "${TEMP_WORK_DIR}" ]]; then
        rm -rf "${TEMP_WORK_DIR}"
    fi

    if [[ ${exit_code} -ne 0 ]]; then
        log_error "Backup run terminated with error (exit code: ${exit_code})."
    fi
}
trap cleanup EXIT

# ------------------------------------------------------------------------------
# Backup Execution
# ------------------------------------------------------------------------------
log_info "=================================================="
log_info "Starting backup process..."
log_info "Source Directory      : ${SOURCE_DIR}"
log_info "Destination Directory : ${DEST_DIR}"
log_info "Retention Limit       : ${RETENTION} copies"

ARCHIVE_NAME="backup_${TIMESTAMP}.tar.gz"
TEMP_ARCHIVE="${TEMP_WORK_DIR}/${ARCHIVE_NAME}"
FINAL_ARCHIVE="${DEST_DIR}/${ARCHIVE_NAME}"

# Create compressed archive in temp folder first to prevent corrupted archives
log_info "Creating compressed archive '${ARCHIVE_NAME}'..."
SOURCE_PARENT_DIR=$(dirname "${SOURCE_DIR}")
SOURCE_BASE_NAME=$(basename "${SOURCE_DIR}")

tar -czf "${TEMP_ARCHIVE}" -C "${SOURCE_PARENT_DIR}" "${SOURCE_BASE_NAME}"

ARCHIVE_SIZE=$(du -h "${TEMP_ARCHIVE}" | cut -f1)
log_info "Archive created successfully (Size: ${ARCHIVE_SIZE})."

# Move archive into final destination
mv "${TEMP_ARCHIVE}" "${FINAL_ARCHIVE}"
log_info "Archive moved to destination: ${FINAL_ARCHIVE}"

# ------------------------------------------------------------------------------
# Backup Rotation (Keep latest N backups)
# ------------------------------------------------------------------------------
log_info "Checking backup rotation policy (Retain latest ${RETENTION})..."

# List archives matching pattern sorted by modification time (newest first)
# Use find + sort to handle standard file paths safely
mapfile -t BACKUP_FILES < <(find "${DEST_DIR}" -maxdepth 1 -type f -name "backup_*.tar.gz" -printf "%T@ %p\n" | sort -nr | awk '{print $2}')
TOTAL_BACKUPS="${#BACKUP_FILES[@]}"

log_info "Total backups found in destination: ${TOTAL_BACKUPS}"

if [[ "${TOTAL_BACKUPS}" -gt "${RETENTION}" ]]; then
    PRUNE_COUNT=$((TOTAL_BACKUPS - RETENTION))
    log_info "Pruning ${PRUNE_COUNT} old backup(s)..."

    for ((i = RETENTION; i < TOTAL_BACKUPS; i++)); do
        OLD_FILE="${BACKUP_FILES[$i]}"
        log_info "Removing old backup: $(basename "${OLD_FILE}")"
        rm -f "${OLD_FILE}"
    done
else
    log_info "No backup pruning needed at this time."
fi

log_info "Backup operation completed successfully."
log_info "=================================================="

exit 0
