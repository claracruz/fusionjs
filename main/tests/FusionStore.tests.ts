/// <reference path="../typings/globals/mocha/index.d.ts" />
import { FusionModel } from '../model/FusionModel';
import { FusionStore } from '../store/FusionStore';
import { assert } from 'assert';
import { expect } from 'chai';

describe('FusionStore', () => {

	describe('#initialise', () => {
        let testData = [{ testId: 123 }],
            testStore;
        
        class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
                name: 'testId',
                type: 'string'
            }];
		}
        testStore = new FusionStore({
            model: TestModel,
            data: testData
        });
		
        it('should configure store with provided arguments', () => {
            expect(testStore.model).to.equal(TestModel);
            expect(testStore.toObject()).to.deep.equal(testData);
		});
	});

    describe('#Handles data correctly', () => {
        let testData = [{ testId: 123 }],
            testStore;
        
        class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
                name: 'testId',
                type: 'string'
            }];
		}
        testStore = new FusionStore({
            model: TestModel,
            data: testData
        });

        testStore.set([{ testId: 456 }]);
		
        it('should set expected data', () => {
            expect(testStore.toObject()).to.deep.equal([{ testId: 123 }, { testId: 456 }]);
		});
        it('should get expected records', () => {
            let storeRecords = testStore.get();
            expect(storeRecords[0]).to.be.an.instanceof(TestModel);
            expect(storeRecords[1]).to.be.an.instanceof(TestModel);
            expect(storeRecords[0].get()).to.deep.equal({ testId: 123 });
            expect(storeRecords[1].get()).to.deep.equal({ testId: 456 });
		});
        it('should get expected record if id to get specified', () => {
            let storeRecord = testStore.get('123');
            expect(storeRecord).to.be.an.instanceof(TestModel);
             expect(storeRecord.get()).to.deep.equal({ testId: 123 });
        });
        it('should reset store correctly', () => {
            testStore.reset();
           expect(testStore.toObject()).to.deep.equal([]);
        });
	});

    describe('#Can check equality', () => {
        let testData = [{ testId: 123 }],
            testStore, testStore2, testStore3;
        
        class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
                name: 'testId',
                type: 'string'
            }];
		}
        testStore = new FusionStore({
            model: TestModel,
            data: testData
        });
        testStore2 = new FusionStore({
            model: TestModel,
            data: testData
        });
        testStore3 = new FusionStore({
            model: TestModel,
            data: testData
        });
		
        it('Correctly checks equality when store is same instance and records are equal', () => {
            expect(testStore.equals(testStore)).to.be.true;
		});
        it('Correctly checks equality when store is different instance and records are equal', () => {
            expect(testStore.equals(testStore2)).to.be.true;
		});
        it('Correctly checks equality when store is different instance and records are not equal', () => {
            testStore3.set([{ testId: 456 }]);
            expect(testStore.equals(testStore3)).to.be.false;
		});
	});

    describe('#Can check strict equality', () => {
        let testData = [{ testId: 123 }],
            testStore, testStore2;
        
        class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
                name: 'testId',
                type: 'string'
            }];
		}
        testStore = new FusionStore({
            model: TestModel,
            data: testData
        });
        
        testStore2 = new FusionStore({
            model: TestModel,
            data: testData
        });

        testStore2.set([{ testId: 456 }]);
		
        it('Correctly checks equality when store is different instance', () => {
            expect(testStore.strictEquals(testStore2)).to.be.false;
		});
        it('Correctly checks equality when store is same instance and records are equal', () => {
            expect(testStore.equals(testStore)).to.be.true;
		});
	});

});