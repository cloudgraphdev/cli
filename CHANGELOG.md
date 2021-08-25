## [0.3.4](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.3.3...0.3.4) (2021-08-25)


### Bug Fixes

* **init:** update init command for provider/cg config overwrite to be y/n ([4047199](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/4047199686adc81399c88081d9c543486cfc5bcb))

## [0.3.3](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.3.2...0.3.3) (2021-08-25)


### Bug Fixes

* **storage:** fixed error handling when pushing data ([425efae](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/425efae4ea89154f10464bb777fb37bcd635c112))
* Fixed error handling when pushing data ([97cc8bb](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/97cc8bb4f395ecf5fddaefc87a597aa99a480f48))

## [0.3.2](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.3.1...0.3.2) (2021-08-25)


### Bug Fixes

* **README:** license badge, alignment ([6933533](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/69335330faf0709d61fda01e63baed0a77b99f17))

## [0.3.1](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.3.0...0.3.1) (2021-08-24)


### Bug Fixes

* Fixed RPC transaction errors using retry method ([54b054e](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/54b054e42c795c2eee7aa2bd1431ded9696fcd54))

# [0.3.0](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.2.1...0.3.0) (2021-08-24)


### Bug Fixes

* **config:** update getConfig to work when there is no existing config ([5d3a70b](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/5d3a70bd680e8e20c3445f1c72b806022c68846b))
* **init:** update init to output where it has stored the config ([bbca608](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/bbca608a42fa1212f5a0a7d92c8ebf7681a49436))
* **init:** update with log for where data will be stored ([e755b41](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/e755b41e813ef22245838ab3097d99df04ff0903))
* **launch:** Fix data path for dgraph data ([c72d4f5](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/c72d4f59c4dd34f9e30f981cd53c0fa4eab266db))


### Features

* **dir:** fix issues with dir access, remove console logs ([85a358e](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/85a358efd38e809748fa857b28a9e02c81727447))

## [0.2.1](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.2.0...0.2.1) (2021-08-23)


### Bug Fixes

* **package:** update Github references ([612461c](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/612461cc5c6511bac2d496898fb0f43d8145bc9b))
* update Github references ([23793dc](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/23793dca8ec274a6cfe9a9184a4b98966dfdad81))

# [0.2.0](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.1.2...0.2.0) (2021-08-23)


### Features

* **provider:** rework the provider interface to simplify the needed functions ([ecaafc1](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/ecaafc1dfdb9496150b4d36bab0920e5cbde28e4))

## [0.1.2](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.1.1...0.1.2) (2021-08-23)


### Bug Fixes

* **README:** update badge links ([609a59a](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/609a59a29a4233d12ec7a2cb261fc3bd3c32949a))
* **README:** update version/downloads badge url ([03586e6](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/03586e6f555a82d362ec05845aeb69f71687e9ee))

## [0.1.1](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.1.0...0.1.1) (2021-08-22)


### Bug Fixes

* **readme:** update readme with contribution guidelines. ([01410cf](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/01410cf3eed3aedc6ead635f955bff556d434476))

# [0.1.0](https://gitlab.com/auto-cloud/cloudgraph/cli/compare/0.0.1...0.1.0) (2021-08-22)


### Bug Fixes

* **client:** cannot destructure client because it loses this context, fixing client calls in commands ([b8a7312](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/b8a7312aa76ea1291e35bf75b16e00eeebb1ca75))
* **connections:** update getConnectedEntity to handle multiple of same entity ([11251eb](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/11251ebaab5e2780e0d18a2641bc8aef83174fc2))
* **deps:** add missing dep @cloudgraph/sdk ([edda949](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/edda94907a6b2d253f87141dfc1a1ca7a2bfd65c))
* **getSchema:** use updated getSchema, pass schema as string ([80f9d08](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/80f9d08482ecb5e3f10c294fc1e7460f90ed2fae))
* **package:** bump node types version, oclif-dev readme ([8d49ac8](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/8d49ac8226c78a8f182a236094e7c15260f1367c))
* **package:** printWelcomeMessage signature ([543b7ed](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/543b7edc5f66289423ab7cef8c5f8a8997e251ec))
* **package:** update bin command, bump typescript version ([691ced6](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/691ced61d0c21898f7b75176d0debbe352132bcd))
* **package:** update sdk package name ([9ebf4db](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/9ebf4db937ae32a219d46b493466c36b118833e1))
* **plugin-manager:** use absolute path for plugins ([87093af](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/87093af84fdec96189c1b76c183a4feacf78d6cb))
* **README:** update to match bin command ([7ae6c25](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/7ae6c25151b7829bda556e0450add3ca5cab7760))
* **types:** update func return types, update serve command to show in help, small fixes ([1008ab5](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/1008ab51e9e1aef79b2aa98c6833e1f2757b78ca))


### Features

* **ESLint:** eslint rules setup ([98c0f51](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/98c0f511c1bebd119e67a299709e3dde4ff52c15))
* **LICENSE:** license as MPL v2.0 ([1c57c21](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/1c57c21fe8eddf9ca3cdb457d2b1d551f43b16c6))
* **logger:** update how the logger is integrated into provider modules and util funcs ([dc902d7](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/dc902d73644a0db31fc4452a3c0ef777a24c6547))
* **manager:** update manager to new naming convention for community plugins ([0029d2c](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/0029d2c513fda9fc434bb30d6ef697bd665de96c))
* **README:** add install, quick start ([99d4ccf](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/99d4ccfe28cde90c57f18599431a55bc801e46f2))
* **serve:** Serve command and query engine integrations ([01ff17d](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/01ff17dfafb908105aa1addce67ac3a57c4cd522))
* **versions:** rework how data is saved in the cli (cg dir). Now save... ([c33b1dc](https://gitlab.com/auto-cloud/cloudgraph/cli/commit/c33b1dcccbe67bc21a4c8992de4e412ccb630cbb))
