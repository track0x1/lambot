# lambot

> A starting point for serverless automation.

[View the original blog post.](https://beuteiful.com/blog/make-your-own-serverless-ci/)

Feel free to fork this repo or suggest improvements or changes.

## Structure

* `/image` - The Docker source for building a custom image for Lambot to use in ECS.
* `/infra` - Terraform infrastructure for creating Lambot's ECS cluster, service, and task definition.
* `/lib` - Lambot lambda source code
  * `/clients` - Helper clients for interfacing with other
  * `/tasks` - Lambot supported tasks
  * `config.js` - Rudimentary Lambot configuration for demonstration purposes. Anything secure should be in parameter store.
  * `index.js` - Lambot lambda entrypoint

## Prerequisites

The source code in this repository assumes at-least basic knowledge of:
* [Lambdas](https://aws.amazon.com/lambda/)
* [Serverless](https://serverless.com/)
* [Terraform](https://www.terraform.io/)
* [Docker](https://www.docker.com/)

## License
MIT
