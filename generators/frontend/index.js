"use strict";
import Generator from "yeoman-generator";

export default class FrontendGenerator extends Generator {
  initializing () {
    try {
      this.spawnSync("uv", ["--version"], { stdio : 'pipe' });
    } catch (error) {
      this.log(`Error: uv is not installed. Please install uv and try again.`);
      process.exit(1);
    }
  }

  async prompting() {
    this.parent = this.options.parent;
    this.props = this.parent.props;
    const prompts = [
      {
        type: "confirm",
        name: "withFrontend",
        message: "Do you want to configure your solution with a frontend?",
        default: true,
        when: (answers) => !this.options.hasOwnProperty("withFrontend"),
      },
    ];

    return this.prompt(prompts).then(answers => {
      this.parent.props = { ...this.parent.props, ...answers };
      this.parent.props.withFrontend = ((answers.withFrontend || this.parent.props.withFrontend) + '').toLowerCase() === 'true'

    });
  }

  default() {
    this.props = this.parent.props;
  }

  writing() {
    if (!this.props.withFrontend) {
      return;
    }
    this.log(`🎨 Creating frontend...`);

    this.fs.copyTpl(
      this.templatePath("src/frontend"),
      this.destinationPath("src/frontend"),
      this.props
    );
    this.fs.write(
      this.destinationPath("src/frontend/.python-version"),
      this.props.pythonVersion
    );
    if (this.props.solutionLevel == 100) {
      this.fs.copy(
        this.templatePath("src/frontend/.dockerignore"),
        this.destinationPath("src/frontend/.dockerignore")
      );
    }
  }

  end() {
    if (!this.props.withFrontend) {
      return;
    }
    this.log(`Executing 'uv sync' in 'src/fronted'...`);

    this.spawnSync("uv", ["sync"], {
      cwd: this.destinationPath('src/frontend'),
    });
  }
};
