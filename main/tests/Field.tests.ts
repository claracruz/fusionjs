/// <reference path="../typings/globals/mocha/index.d.ts" />
import { Field } from '../model/Field';
import { assert } from 'assert';
import { expect } from 'chai';

describe('Field', () => {

	describe('#initialise', () => {
		const field = new Field({
            name: 'testId',
            type: 'string',
            value: 'testValue'
        });

		it('should configure field', () => {
            expect(field.name).to.equal('testId');
            expect(field.type).to.equal('string');
            expect(field.value).to.equal('testValue');
		});
    });
    
    describe('#sets and gets values', () => {

		it('should set field value', () => {
            const field = new Field({
                name: 'testId',
                type: 'string'
            });
            expect(field.value).to.equal(undefined);
            field.set('testValue');
            expect(field.value).to.equal('testValue');
        });
        
        it('should get field value', () => {
            const field = new Field({
                name: 'testId',
                type: 'string',
                value: 'testValue'
            });
            expect(field.get()).to.equal('testValue');
        });
        
        it('can handle default values when defined', () => {
            const field = new Field({
                name: 'testId',
                type: 'string',
                defaultValue: 'testDefaultValue'
            });
            expect(field.defaultValue).to.equal('testDefaultValue');
            expect(field.get()).to.equal('testDefaultValue');
        });

        it('can handle default values when none provided', () => {
            const field = new Field({
                name: 'testId',
                type: 'string'
            });
            expect(field.defaultValue).to.equal(undefined);
        });
	});
});