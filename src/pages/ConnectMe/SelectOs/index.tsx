import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";

import { clients } from "../ConnectMeData";
import { Client, ClientOs, ClientPanelProps } from "../ConnectMeTypes";
import { useGreeting } from "../../../hooks/useGreeting";
import { selectors } from "../../../ducks/auth";
import TopBar from "../../../components/TopBar";
import Page from "../../../components/Page";
import Loader from "../../../components/Loader";
import connectMeRoute from "..";

function SelectOs({ onClick }: { onClick: (client: Client) => void }) {
  const [detectedClient, setDetectedClient] = useState<ClientOs>();
  const [appVersion, setAppVersion] = useState<string>();
  const { greeting } = useGreeting();
  const userProfile = useSelector(selectors.selectUserProfile);

  useEffect(() => {
    setDetectedClient(getOperatingSystem());

    // GET request using fetch - dopwnload version number from CDN
    fetch('https://download.shieldoo.io/latest/version.txt',{mode: 'cors', cache: 'no-store'})
        .then(response => response.text())
        .then(data => setAppVersion(data.trim()));
  }, []);

  const preferredClient = clients.find(c => c.os === detectedClient);
  const filteredClients = clients.filter(c => c.os !== detectedClient && c.clientInstall);

  const topBar = (
    <TopBar size="full">
      <div className="select-os">
        <Greeting greeting={greeting} name={userProfile?.name || ""} client={preferredClient} />
        {detectedClient === undefined && <Loader size="5x" />}
        {preferredClient && (
          <>
            <div className="shadow-container">
              <ClientPanel
                key={`client-${preferredClient?.os}`}
                os={preferredClient?.os}
                note={preferredClient?.note}
                isDisabled={preferredClient?.isDisabled}
                onClick={() => onClick(preferredClient)}
                appVersion={appVersion}
              />
            </div>
            <div className="info text-white">
              Other operating systems:
            </div>
          </>
        )}
        <div className="shadow-container">
          {filteredClients.map(c => (
            <ClientPanel
              key={`client-${c.os}`}
              os={c.os}
              note={c.note}
              isDisabled={c.isDisabled}
              onClick={() => onClick(c)}
              appVersion={appVersion}
            />
          ))}
        </div>
      </div>
    </TopBar>
  );

  return <Page windowTitle={connectMeRoute.title} className="page-client-setup" topBar={topBar}></Page>;
}

function Greeting({ greeting, name, client }: { greeting: string; name: string; client?: Client }) {
  return (
    <>
      <div className="title text-white">
        <i className="fa fa-hand-spock-o pr-2" />
        {greeting}, <b>{name}</b>.<br/>
        Let’s connect you to Shieldoo Secure Network!
      </div>
      <div className="info">
        You need to install the desktop client.
        <br/>
        <br/>
        {client && <>It looks like you are running on {client.os}:</>}
      </div>
    </>
  );
}
function ClientPanel(props: ClientPanelProps) {
  return (
    <div className="select-os-item">
      <div className="icon">
        <LogoByOs os={props.os} />
      </div>
      <div className="content">
        <div className="name">{props.os}</div>
        <div className="description">Shieldoo client version: {props.appVersion}, {props.note}</div>
      </div>
      <div className="action">
        <Button
          className="p-button-secondary"
          icon={<i className="fa fa-arrow-right" />}
          onClick={() => props.onClick(props.os)}
          disabled={props.isDisabled}
        />
      </div>
    </div>
  );
}

function LogoByOs({ os }: { os: ClientOs }) {
  switch (os) {
    case ClientOs.Windows:
      return <i className="fa fa-windows fa-4x" />;
    case ClientOs.MacOS:
      return <i className="fa fa-apple fa-4x" />;
    case ClientOs.Linux:
      return <i className="fa fa-linux fa-4x" />;
    case ClientOs.Android:
      return <i className="fa fa-android fa-4x" />;
    case ClientOs.iOS:
      return <i className="fa fa-apple fa-4x" />;
    case ClientOs.Unsupported:
    default:
      return <></>;
  }
}

function getOperatingSystem() {
  if (window.navigator.userAgent.indexOf("Android") !== -1) {
    return ClientOs.Android;
  }
  if (window.navigator.userAgent.indexOf("iPhone") !== -1) {
    return ClientOs.iOS;
  }
  if (window.navigator.userAgent.indexOf("iPad") !== -1) {
    return ClientOs.iOS;
  }
  if (window.navigator.userAgent.indexOf("iPod") !== -1) {
    return ClientOs.iOS;
  }
  if (window.navigator.userAgent.indexOf("Win") !== -1) {
    return ClientOs.Windows;
  }
  if (window.navigator.userAgent.indexOf("Mac") !== -1) {
    return ClientOs.MacOS;
  }
  if (window.navigator.userAgent.indexOf("Linux") !== -1) {
    return ClientOs.Linux;
  }
  if (window.navigator.userAgent.indexOf("X11") !== -1) {
    return ClientOs.Unsupported;
  }

  return ClientOs.Unsupported;
}

export default SelectOs;
