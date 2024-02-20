import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const right_click_install_en = "If you have admin privileges on windows and wishes the minimum components of SDK, you can just right-click the downloaded script and choose \"Run with Posweshell\".";
const right_click_install_ja = "Windowsで管理者権限を持っていて、最小限のコンポーネントをインストールしたい場合、ダウンロードしたスクリプトを右クリックして「PowerShellで実行」を選択するだけで済みます。";

const user_install_en = " can open powershell terminal and type ";
const user_install_ja1 = "PowerShellターミナルを開いて";
const user_install_ja2 = "と入力します。";


const shorter_install_default = "installer.ps1 -user <username>";

const LangSwitcher = ({islatest, version}) => {
  const {siteConfig, i18n}  = useDocusaurusContext();
  
  if (i18n.currentLocale == 'en'){
    if (islatest){
      return <p>{right_click_install_en} Otherwise, you  {user_install_en} <code>{shorter_install_default}</code>.</p>;
    }
    const this_ver = version;
    return <p>You {user_install_en} <code>{shorter_install_default} -version {this_ver}</code>.</p>;
  }

  if (i18n.currentLocale == 'ja'){
    if (islatest){
      return <p>{right_click_install_ja}それ以外の場合、{user_install_ja1} <code>{shorter_install_default}</code>{user_install_ja2}</p>;
    }
    const this_ver = version;
    return <p>{user_install_ja1} <code>{shorter_install_default} -version {this_ver}</code>{user_install_ja2}</p>;
  }

  return <p></p>;

}

export default LangSwitcher;