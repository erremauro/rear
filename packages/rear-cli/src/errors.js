// @flow
import RearError from 'rear-core/rear-error';

export class InvalidNpmName extends RearError {
  constructor (message: string) {
    super(message, {
      code: 'ENAMENPMINVALID',
      description: 'App name is not a valid npm package name.',
      errno: 312,
    });
  }
}


interface AppNameConflictProps {
  dependencies: Array<string>
}

export class AppNameConflict extends RearError {
  constructor (message: string, props: AppNameConflictProps) {
    super(message, {
      code: 'ENAMECONFLICT',
      errno: 323,
      description: 'A dependency with the same name already exists.',
      ...props
    });

    this.dependencies = props.dependencies;
  }
}


interface InvalidVersionProps {
  program: string,
  minVersion: string,
  version: string
}

export class InvalidVersion extends RearError {
  constructor (props: InvalidVersionProps) {
    const message = `The ${props.program} version ${props.version} `
        + `you are using is unsupported.`;
    super(message, {
      code: 'EINVALIDVERSION',
      description: message,
      errno: 337,
      ...props
    });

    this.program = this.props.program;
    this.minVersion = this.props.minVersion;
    this.version = this.props.version;
  }
}


interface DirectoryConflictProps {
  conflicts: Array<string>,
  directory: string
};

export class DirectoryConflict extends RearError {
  constructor (message: string, props: DirectoryConflictProps) {
    super(message, {
      code: 'EDIRCONFLICT',
      description: `The directory ${props.directory} contains files that could conflict`,
      errno: 348,
      ...props
    });
    this.directory = props.directory;
    this.conflicts = props.conflicts;
  }
}

type CommandFailureProps = {
  command: string
}

export class CommandFailure extends RearError {
  constructor (props: CommandFailureProps) {
    const message = `${props.command} has failed.`;
    super(message, {
      code: 'ECMDFAILURE',
      description: message,
      errno: 500,
      ...props
    });
    this.command = this.props.command;
  }
}

export class CommandNotFound extends RearError {
  constructor (command: string, suggestion?: string) {
    let message = `Command ${JSON.stringify(command)} not found.`;

    if (suggestion) {
      message += ` Did you mean ${JSON.stringify(suggestion)}?`;
    }

    super(message, {
      code: 'ECMDNOTFOUND',
      description: message,
      errno: 405,
      suggestion
    });
  }
}

export class TemplateNotFound extends RearError {
  constructor (packageName: string, templatePath: string) {
    const message = `Cannot find ${packageName} template at path ${templatePath}`;
    super(message, {templatePath, packageName});
    this.package = packageName;
    this.template = templatePath;
  }
}
