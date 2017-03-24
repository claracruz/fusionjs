/// <reference path="../typings/globals/mocha/index.d.ts" />
import { FusionImmutable } from '../model/FusionImmutable';
import { FusionModel } from '../model/FusionModel';
import { assert } from 'assert';
import { expect } from 'chai';

describe('FusionImmutable', () => {

	describe('#Setting dataset', () => {
        class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
            constructor(data) {
				super(data);
				this.init();
			}
		}
		let fusionImmutable = new FusionImmutable(TestModel);
		let test = fusionImmutable.fromJS({
			testId: 123
		});
        it('should return new instance of defined model when data set', () => {
            expect(test).to.be.an.instanceof(TestModel);
		});
		it('provided dataset should be set', () => {
            expect(test.toObject()).to.deep.equal({testId: 123});
		});
	});

    describe('#Merge data', () => {
        class TestRelModel extends FusionModel {
			idProperty = 'relId';
			fields = [{
				name: 'relId',
				type: 'string'
			}, {
				name: 'foo',
				type: 'string'
			}];
            constructor(data) {
				super(data);
				this.init();
			}
		}
        class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
            hasMany = [{
                name: 'rels',
                model: TestRelModel
            }];          
            constructor(data) {
				super(data);
				this.init();
            }
            rels () {};
		}
		let testData = [{relId: 12, foo: 'bar'}, {relId: 34, foo: 'foo-bar'}, {relId: 56, foo: 'bar-foo'}],
            fusionImmutable = new FusionImmutable(TestModel),
            testModelInstance = fusionImmutable.fromJS({
                testId: 123,
                rels: testData
            });
			let test = fusionImmutable.merge(testModelInstance, {id: 56, foo: 'bar-foo-changed'}, testModelInstance.rels().get('56'));

        it('should return new instance of defined model when data merged', () => {	  
              expect(testModelInstance).to.be.an.instanceof(TestModel);
		});
		it('provided dataset should be merged', () => {	
              expect(test.toObject()).to.deep.equal({testId: 123, rels: [{relId: 12, foo: 'bar'}, {relId: 34, foo: 'foo-bar'}, {relId: 56, foo: 'bar-foo-changed'}]});
		});
	});

});