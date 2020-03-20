import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { TreeWithSearch, ITreeViewProps } from "./Components/TreeView";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DynamicsFetcher } from "./Fetchers/DynamicsFetcher";
import { MockFetcher } from "./Fetchers/MockFetcher";
import { RelationshipMap } from "./Models/RelationshipMap";
import { Alert } from "antd";
import { object } from "prop-types";
import { ITreeNode } from "./Models/TreeNode";

export class TreeView implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private container: HTMLDivElement;
	
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.container = container;
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		try {
			let {isMock, relationshipMap, maxHeight, downloadAttachments} = context.parameters;
			let id: string = (<any>context).page.entityId;
			let mock = isMock.raw === 'yes' ? true : false;
			let map: RelationshipMap = mock ? {entityName: '', titleField: ''} : JSON.parse(relationshipMap.raw!);
			let fetcher = mock ? new MockFetcher() : new DynamicsFetcher(id, context, map);
			
			let props: ITreeViewProps = {
				fetcher: fetcher, 
				openWindow: (node) => this.openRecord(context, node, (downloadAttachments.raw === 'yes')),
				maxHeight: (maxHeight.raw || undefined)
			}
			ReactDOM.render(React.createElement(TreeWithSearch, props), this.container);	
		} catch (e) {
			console.error(e);
			let errormsg = "An unknown error occured, see log.";			
			ReactDOM.render(React.createElement(Alert, {message: errormsg, type: "error"}), this.container);
		}
		
	}

	private openRecord(context: ComponentFramework.Context<IInputs>, node: ITreeNode, download?: boolean){
		if(node.entityName === 'annotation' && node.annotatoinFields !== undefined){
			let base64 = `data:${node.annotatoinFields.mimetype};base64,${node.annotatoinFields.body}`;
			
			if(download){
				fetch(base64).then(x => x.blob()).then(fileBlob => {
					let url = window.URL.createObjectURL(fileBlob);
					let downloadTag = document.createElement("a");
					downloadTag.href = url;
					downloadTag.download = node.annotatoinFields!.filename;
					downloadTag.click();
				});
			}
			else{
				fetch(base64).then(x => x.blob()).then(fileBlob => {
					let url = window.URL.createObjectURL(fileBlob);
					context.navigation.openUrl(url);
				});
			}
		}
		else{
			context.navigation.openForm({entityName: node.entityName, entityId: node.id, openInNewWindow: true});
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		ReactDOM.unmountComponentAtNode(this.container);
	}
}