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
