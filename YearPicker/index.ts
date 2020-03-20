import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class YearPicker implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _input: HTMLInputElement;
	private _value: Date | undefined;
	private _notifyOutputChanged: () => void;
	private _refreshData: EventListenerOrEventListenerObject;
	private _updateValue: () => void;

	constructor() {
		var head = document.head;
		var style = document.createElement("style");
		
		style.type = "text/css";
		style.appendChild(document.createTextNode(".YearPicker input[type=\"number\"] { background-color: rgb(255, 255, 255); border-bottom-color: rgba(0, 0, 0, 0); border-bottom-style: solid; border-bottom-width: 1px; border-image-outset: 0px; border-image-repeat: stretch; border-image-slice: 100%; border-image-source: none; border-image-width: 1; border-left-color: rgba(0, 0, 0, 0); border-left-style: solid; border-left-width: 1px; border-right-color: rgba(0, 0, 0, 0); border-right-style: solid; border-right-width: 1px; border-top-color: rgba(0, 0, 0, 0); border-top-style: solid; border-top-width: 1px; box-sizing: border-box; color: rgb(0, 0, 0); cursor: text; display: block; font-family: SegoeUI, \"Segoe UI\"; font-size: 14px; font-stretch: 100%; font-style: normal; font-variant-caps: normal; font-variant-east-asian: normal; font-variant-ligatures: normal; font-variant-numeric: normal; font-weight: 600; height: 35px; letter-spacing: normal; line-height: 35px; margin-bottom: 0px; margin-left: 0px; margin-right: 0px; margin-top: 0px; outline-color: rgb(0, 0, 0); outline-style: none; outline-width: 0px; padding-bottom: 0px; padding-left: 7px; padding-right: 7px; padding-top: 0px; text-align: start; text-indent: 0px; text-overflow: ellipsis; text-rendering: auto; text-shadow: none; text-transform: none; white-space: normal; width: 100%; word-break: normal; word-spacing: 0px; writing-mode: horizontal-tb; -webkit-appearance: none; -webkit-rtl-ordering: logical; -webkit-border-image: none; }"));
		style.appendChild(document.createTextNode(".YearPicker input[type=\"number\"]:hover { background-color: rgb(255, 255, 255); border-bottom-color: rgb(102, 102, 102); border-bottom-style: solid; border-bottom-width: 1px; border-image-outset: 0px; border-image-repeat: stretch; border-image-slice: 100%; border-image-source: none; border-image-width: 1; border-left-color: rgb(102, 102, 102); border-left-style: solid; border-left-width: 1px; border-right-color: rgb(102, 102, 102); border-right-style: solid; border-right-width: 1px; border-top-color: rgb(102, 102, 102); border-top-style: solid; border-top-width: 1px; box-sizing: border-box; color: rgb(0, 0, 0); cursor: text; display: block; font-family: SegoeUI, \"Segoe UI\"; font-size: 14px; font-stretch: 100%; font-style: normal; font-variant-caps: normal; font-variant-east-asian: normal; font-variant-ligatures: normal; font-variant-numeric: normal; font-weight: 400; height: 35px; letter-spacing: normal; line-height: 35px; margin-bottom: 0px; margin-left: 0px; margin-right: 0px; margin-top: 0px; outline-color: rgb(0, 0, 0); outline-style: none; outline-width: 0px; padding-bottom: 0px; padding-left: 7px; padding-right: 7px; padding-top: 0px; text-align: start; text-indent: 0px; text-overflow: ellipsis; text-rendering: auto; text-shadow: none; text-transform: none; white-space: normal; width: 100%; word-break: normal; word-spacing: 0px; writing-mode: horizontal-tb; -webkit-appearance: none; -webkit-rtl-ordering: logical; -webkit-border-image: none; }"));
		head.appendChild(style);
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, 
		notifyOutputChanged: () => void, 
		state: ComponentFramework.Dictionary, 
		container:HTMLDivElement)
	{
		this._value = context.parameters.value.raw || undefined;

		this._notifyOutputChanged = notifyOutputChanged;
		this._refreshData = this.refreshData.bind(this);
		this._updateValue = this.updateValue.bind(this);
		
		this._input = document.createElement("input")
		this._input.setAttribute("type", "number");
		this._input.addEventListener("input", this._refreshData);
		
		container.appendChild(this._input);
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._value = context.parameters.value.raw || undefined;
		this._updateValue();
	}

	private updateValue() {
		if (this._value === undefined) {
			this._input.setAttribute("value","");
			return;
		}

		this._input.setAttribute("value", this._value.getFullYear().toString());
	}

	private refreshData(evt: Event) {
		if (this._input.value === "" || 
			this._input.value === null ||
			this._input.value === undefined) {
			this._value = undefined;
			this._updateValue();
			this._notifyOutputChanged();
			return;
		}

		let rawNumber = (this._input.value as any) as number;
		if (rawNumber < 1000) return;

		let newValue = new Date(rawNumber,0);
		if (newValue < new Date(1753,0)) {
			alert("Minimum year in CDS is 1753");
			this._updateValue();
			return;
		}

		this._value = newValue;
		this._notifyOutputChanged();
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {value: this._value};				
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		
	}
}