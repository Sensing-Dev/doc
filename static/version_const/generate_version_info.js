
const GenerateVersionInfo = ({is_latest, latest_version, latest_winUSB_URL}) => {
  const one_line_install_default = "powershell.exe -ExecutionPolicy Bypass -File installer.ps1 -user <username>";

  const latest_URL = 'https://github.com/Sensing-Dev/sensing-dev-installer/releases/download/' + latest_version;
  const latest_installer_URL = latest_URL + '/installer.ps1';
  const latest_setup_URL = latest_URL + '/setup.sh';

  const one_line_install = (is_latest === true) ? one_line_install_default : one_line_install_default + " -version " + latest_version ;

  const tutorial_version = (is_latest) ? "main" :  latest_version;

  const one_line_powershell = "Invoke-WebRequest -Uri https://github.com/Sensing-Dev/WinUSB-installer-generator/releases/download/"+latest_winUSB_URL+"/generate_and_apply_WinUSB.ps1 -OutFile generate_and_apply_WinUSB.ps1 -Verbose; powershell.exe -ExecutionPolicy Bypass -File ./generate_and_apply_WinUSB.ps1"
  
  const linux_version = (is_latest) ? "" : "--version " + latest_version;

  return {
    latest_installer_URL: latest_installer_URL,
    one_line_powershell: one_line_powershell,
    one_line_install: one_line_install,
    tutorial_version: tutorial_version,
    latest_setup_URL: latest_setup_URL,
    linux_version: linux_version
  }
}

module.exports = GenerateVersionInfo;