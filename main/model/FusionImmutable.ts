import {FusionModel} from './FusionModel';

/**
 * @module
 * @description Provides immutable data management capabilities to FusionModels
 */
export class FusionImmutable {

	/**
     * @type {FusionModel}
     * @description A FusionModel derived class that requires the imuutability
     */
	ModelClass: any;

	/**
     * @constructor
     */
	constructor (ModelClass: any) {
        this.ModelClass = ModelClass;
    }

	/**
     * @description Returns an instance of the provided model set to the data provided
     */
	fromJS(data) {
		return new this.ModelClass(data);
	}

	/**
     * @description The crux of the module. Enables nested record to be updated and
	 * returns a new instance of the provided model with updated data.
     */
	merge (model, data, record) {
		let newModel = new this.ModelClass(model.toObject()),
			newModelRecord;
		if (record) {
			newModelRecord = newModel.find(record);
			newModelRecord.set(data);
		} else {
			newModel.set(data);
		}
		return newModel;
	}

	/**
     * @description Compares data in the record with existing record in the provided model
     */
	static compare (model, record) {
		let recordInModel = model.get(record.get(record.idProperty)),
			isEqual = recordInModel === record;
		return (!isEqual) ? isEqual : recordInModel.equals(record);
	}

	/**
     * @description Returns the dataset that composes the model as a pure JS object
     */
	static toJS (model) {
		return model.toObject();
	}
}