import {scenariosIndex} from 'Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator';
import {ScenarioMetadata} from 'Leaf.lspkg/Scenarios/scenario/ScenarioMetadata';
import {DripLineCriterion1} from './DripLineCriterion1';
import {DripLineCriterion2} from './DripLineCriterion2';
import {DripLineCriterion3} from './DripLineCriterion3';
import {DripLineCriterion4} from './DripLineCriterion4';
import {DripLineCriterion5} from './DripLineCriterion5';
@component
export class LeafIndex extends BaseScriptComponent {
 @scenariosIndex
 static scenariosIndex:ScenarioMetadata[]=[
  {id:'dripline-criterion-1',typename:DripLineCriterion1.getTypeName(),parameters:{__leaf__timeout_secs:'340'}},
  {id:'dripline-criterion-2',typename:DripLineCriterion2.getTypeName(),parameters:{__leaf__timeout_secs:'340'}},
  {id:'dripline-criterion-3',typename:DripLineCriterion3.getTypeName(),parameters:{__leaf__timeout_secs:'340'}},
  {id:'dripline-criterion-4',typename:DripLineCriterion4.getTypeName(),parameters:{__leaf__timeout_secs:'340'}},
  {id:'dripline-criterion-5',typename:DripLineCriterion5.getTypeName(),parameters:{__leaf__timeout_secs:'340'}},
 ];
}
