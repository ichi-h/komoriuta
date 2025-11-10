{
  description = "Protobuf Environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        packages = nixpkgs.legacyPackages.${system};
      in
      {
        devShells = {
          default = packages.mkShell {
            buildInputs = with packages; [
              # Protobuf compiler
              protobuf

              # Protobuf plugins for various languages
              protoc-gen-go           # Go plugin
              protoc-gen-go-grpc      # Go gRPC plugin
              protoc-gen-connect-go   # Go Connect plugin

              # Protobuf linting and formatting
              buf                     # Modern protobuf toolchain

              # Additional tools
              grpcurl                 # Testing gRPC/Connect endpoints
            ];

            shellHook = ''
              echo "Protobuf development environment loaded"
              echo "Available tools:"
              echo "  - protoc: $(protoc --version)"
              echo "  - buf: $(buf --version)"
              echo ""
              echo "Run 'buf generate' to generate code from protobuf definitions"
            '';
          };
        };
      }
    );
}
