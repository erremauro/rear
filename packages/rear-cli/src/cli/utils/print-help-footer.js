import {type ReporterType} from '../../reporter';

export default printHelpFooter;

//////////////////////////////////

function printHelpFooter (reporter: ReporterType): void {
  reporter.log();
  reporter.log(
    '  Run %crear help COMMAND%c for more information on specific commands.',
    'yellow', 'reset'
  );
  reporter.log(
    '  Visit %chttps://github.com/rearjs/rear%c to learn more about rear.',
    'bold_underline', 'reset'
  );
  reporter.log();
}
