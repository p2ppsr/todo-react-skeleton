# ToDo Skeleton

Starting-place for the ToDo app tutorial

## Skeleton

This skeleton is the starting place for the [ToDo app tutorial](https://projectbabbage.com/docs/babbage-sdk/building-example-app)!

This is merely a skeleton starting-place for the ToDo app. It only contains basic React tools and a user-interface. To see the fully-complete version, check the [main repo](https://github.com/p2ppsr/todo-react).

## License

The license for the code in this repository is the Open BSV License.


## October2026 Node build security maintenance

Build tooling uses Node22.23.4 with the retained frozen dependency lock and
historical peer resolution. Hosted PR CI verifies native Node/Brotli and the
retained source build with bounded registry requests. Application dependency
versions and browser contracts remain unchanged. Obsolete Cloud Run automation
is archived at `docs/legacy-cloud-run-deploy.yaml.txt` and cannot run. A successful
build does not establish application or production-restoration acceptance.
