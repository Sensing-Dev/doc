import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const prefix = "https://github.com/Sensing-Dev/tutorials/blob";

const python = "python";
const cpp = "cpp/src";
const gstreamer = "gstreamer";

const shorter_install_default = "installer.ps1 -user <username>";

const GenerateTutorialLink = ({language, tag, tutorialfile}) => {
  const {siteConfig, i18n}  = useDocusaurusContext();
  let url = "";

  if (language == 'python'){
    url = prefix + "/" + tag + "/" + python + "/" + tutorialfile + '.py';
  }else if (language == 'cpp'){
    url = prefix + "/" + tag + "/" + cpp + "/" + tutorialfile + '.cpp';
  }else if (language == 'gstreamer'){
    url = prefix + "/" + tag + "/" + gstreamer + "/" + tutorialfile + '.py';
  }else {
    throw new Error("language " + language + " is not supported.");
  }

  if (i18n.currentLocale == 'en'){
    return <p>Complete code used in the tutorial is <a href={url}>here</a>.</p>
  }else if (i18n.currentLocale == 'ja'){
    return <p>このチュートリアルで使用される完全なコードは<a href={url}>こちら</a>です。</p>
  }


}

export default GenerateTutorialLink;