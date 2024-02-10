const latest_version = 'v24.01.03';
const latest_URL = 'https://github.com/Sensing-Dev/sensing-dev-installer/releases/download/' + latest_version;
const latest_installer_URL = latest_URL + '/installer.ps1';

// WinUSB
const latest_winUSB_URL = "v24.02.01"
const one_line_powershell = "Invoke-WebRequest -Uri https://github.com/Sensing-Dev/WinUSB-installer-generator/releases/download/"+latest_winUSB_URL+"/generate_and_apply_WinUSB.ps1 -OutFile generate_and_apply_WinUSB.ps1 -Verbose; powershell.exe -ExecutionPolicy Bypass -File ./generate_and_apply_WinUSB.ps1"

module.exports = {
    latest_version,
    latest_installer_URL,
    one_line_powershell
};
