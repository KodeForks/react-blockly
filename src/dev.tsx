import { useCallback, useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import Blockly from "blockly";
import { BlocklyWorkspace, Workspace } from "./main";
import ConfigFiles from "./initContent/content";
import 'blockly/javascript'

const TestEditor = () => {
  const [toolboxConfig, setToolboxConfig] = useState<object>(ConfigFiles.INITIAL_TOOLBOX_JSON);
  const [xml, setXml] = useState<string>()
  const [code, setCode] = useState<string>()

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setToolboxConfig((prevConfig: any) => ({
        ...prevConfig,
        contents: [
          ...prevConfig.contents,
          {
            kind: "category",
            name: "Dynamically added category",
            contents: [
              { kind: "block", type: "text" },
              {
                kind: "block",
                blockxml:
                  '<block type="text_print"><value name="TEXT"><shadow type="text">abc</shadow></value></block>',
              },
            ],
          },
        ],
      }));
    }, 2000);

    const timer2 = setTimeout(() => {
      setToolboxConfig((prevConfig: any) => ({
        ...prevConfig,
        contents: [
          ...prevConfig.contents.slice(0, prevConfig.contents.length - 1),
          {
            ...prevConfig.contents[prevConfig.contents.length - 1],
            contents: [{ kind: "block", type: "text" }],
          },
        ],
      }));
    }, 4000);

    const timer3 = setTimeout(() => {
      setToolboxConfig((prevConfig: any) => ({
        ...prevConfig,
        contents: [
          ...prevConfig.contents.slice(0, prevConfig.contents.length - 1),
        ],
      }));
    }, 10000);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
    }
  }, []);

  const onWorkspaceChange = useCallback((workspace: Workspace) => {
    workspace.registerButtonCallback("myFirstButtonPressed", () => {
      alert("button is pressed");
    });

    setXml(Blockly.serialization.workspaces.save(workspace))

    setCode(Blockly.JavaScript.workspaceToCode(workspace))
  }, []);

  const onXmlChange = useCallback((newXml: string) => {
    setXml(newXml)
  }, []);

  return (
    <>
      <BlocklyWorkspace
        toolboxConfig={toolboxConfig}
        workspaceConfig={{
          grid: {
            spacing: 20,
            length: 3,
            colour: "#ccc",
            snap: true,
          },
        }}
        initialJson={ConfigFiles.INITIAL_JSON}
        className="fill-height"
        onWorkspaceChange={onWorkspaceChange}
        onXmlChange={onXmlChange}
        style={{ height: 600, width: 800 }}
      />
      <pre>{JSON.stringify(xml, null, 2)}</pre>
      <pre>{code}</pre>
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!)
root.render(<TestEditor />)