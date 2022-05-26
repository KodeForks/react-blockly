import Blockly from "blockly"
import {RefObject} from "react";

export interface CommonBlocklyProps {
    initialJson: string,
    toolboxConfig: Blockly.utils.toolbox.ToolboxDefinition,
    workspaceConfig: Blockly.BlocklyOptions,
    onWorkspaceChange: (workspace: Blockly.WorkspaceSvg) => void,
}

export interface BlocklyWorkspaceProps extends CommonBlocklyProps {
    className: string,
    style: Record<string, unknown>,
    onXmlChange: (xml: string) => void,
}

export interface UseBlocklyProps extends CommonBlocklyProps {
    ref: RefObject<Element>;
}
