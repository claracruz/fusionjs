/**
 * @module
 * @description Fields are used to define the members of a Model. 
 * They aren't instantiated directly; instead, it is used by FusionModel to configure fields into Field instances
 */
interface IField {
    name: string;
    type: string;
    value?: any;	
    defaultValue?: any;
}

export class Field {  

    /**
     *@type {string}
     */
    name: string;

    /**
     *@type {string}
     */
    type: string;

    /**
     *@type {any}
     */
    value: any;

    /**
     *@type {any}
     */
    defaultValue: any = null;

    /**
     * @constructor
     */
    constructor(field: IField) {
        this.name = field.name;
        this.type = field.type;
        this.value = field.value;
        this.defaultValue = field.defaultValue;
        this._setDefaultValues();
    }

    get () {
        return this.value;
    }

    set (value) {
        this.value = value;
    }

    /**
     * @private
     */
    _setDefaultValues () {
        if (typeof this.defaultValue !== 'undefined') {
           this.set(this.defaultValue);
        }        
    }
}