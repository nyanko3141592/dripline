import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {criterion4} from './DripLineChecks';
@component
export class DripLineCriterion4 extends Scenario { async run():Promise<void>{await criterion4();} }
