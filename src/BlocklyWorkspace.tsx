// import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Blockly from "blockly";
import debounce from "./debounce";
import {BlocklyWorkspaceProps} from "./BlocklyWorkspaceProps";

type Workspace = typeof Blockly.Workspace;
type WorkspaceSvg = typeof Blockly.WorkspaceSvg;


// const propTypes = {
//   initialXml: PropTypes.string,
//   toolboxConfiguration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
//   workspaceConfiguration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
//   className: PropTypes.string,
//   onWorkspaceChange: PropTypes.func,
//   onImportXmlError: PropTypes.func,
//   onXmlChange: PropTypes.func,
//   onInject: PropTypes.func,
//   onDispose: PropTypes.func,
// };

// const defaultProps = {
//   initialXml: null,
//   toolboxConfiguration: null,
//   workspaceConfiguration: null,
//   className: null,
//   onWorkspaceChange: null,
//   onImportXmlError: null,
//   onXmlChange: null,
//   onInject: null,
//   onDispose: null,
// };

function BlocklyWorkspace({
  initialJson,
  toolboxConfig,
  workspaceConfig,
  className,
  onWorkspaceChange,
  onXmlChange,
  style
}: BlocklyWorkspaceProps) {
  const ref = useRef(null);
  const [workspace, setWorkspace] = useState<WorkspaceSvg | null>(null);
  const [json, setJson] = useState<string | null>(initialJson);
  const [didInitialImport, setDidInitialImport] = useState(false);
  const [didHandleNewWorkspace, setDidHandleNewWorkspace] = useState(false);

  useEffect(() => {
    if (toolboxConfig && workspace) {
      workspace.updateToolbox(toolboxConfig);
    }
  }, [toolboxConfig, workspace]);

  const handleWorkspaceChanged = useCallback(
    (newWorkspace: Workspace) => {
      if (onWorkspaceChange) {
        onWorkspaceChange(newWorkspace);
      }
    },
    [onWorkspaceChange]
  );

  // Workspace creation
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const newWorkspace = Blockly.inject(ref.current, {
      ...workspaceConfig,
      toolbox: toolboxConfig,
    });
    setWorkspace(newWorkspace);
    setDidInitialImport(false); // force a re-import if we recreate the workspace
    setDidHandleNewWorkspace(false); // Signal that a workspace change event needs to be sent.

    // Dispose of the workspace when our div ref goes away (Equivalent to didComponentUnmount)
    return () => {
      newWorkspace.dispose();
    };
  }, [ref]);

  // Send a workspace change event when the workspace is created
  useEffect(() => {
    if (workspace && !didHandleNewWorkspace) {
      handleWorkspaceChanged(workspace);
    }
  }, [handleWorkspaceChanged, didHandleNewWorkspace, workspace]);

  // Workspace change listener
  useEffect(() => {
    if (!workspace) {
      return;
    }

    const listener = () => {
      handleWorkspaceChanged(workspace);
    };
    workspace.addChangeListener(listener);
    return () => {
      workspace.removeChangeListener(listener);
    };
  }, [workspace, handleWorkspaceChanged]);

  // xmlDidChange callback
  useEffect(() => {
    if (!workspace) {
      return;
    }

    const [callback, cancel] = debounce(() => {
      const newXml = Blockly.serialization.workspaces.save(workspace);
      if (newXml === json) {
        return;
      }

      setJson(newXml);
    }, 200);

    workspace.addChangeListener(callback);

    return () => {
      workspace.removeChangeListener(callback);
      cancel();
    };
  }, [workspace, json]);

  // Initial Xml Changes
  useEffect(() => {
    if (json && workspace && !didInitialImport) {
      Blockly.serialization.workspaces.load(json, workspace);
      setDidInitialImport(true);
    }
  }, [json, workspace, didInitialImport]);

  const onXmlChangeCb = useCallback(onXmlChange, [onXmlChange]);

  useEffect(() => {
    if (json) {
      onXmlChangeCb(json);
    }
  }, [json]);

  return <div className={className} ref={ref} style={style} />;
}

// BlocklyWorkspace.propTypes = propTypes;
// BlocklyWorkspace.defaultProps = defaultProps;

export default BlocklyWorkspace;
