{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    mcp-servers-nix = {
      url = "github:natsukium/mcp-servers-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, mcp-servers-nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        packages = nixpkgs.legacyPackages.${system};
      in
      {
        devShells = {
          default = packages.mkShell {
            buildInputs = with packages; [
              lefthook
            ];
            shellHook = let
              config = mcp-servers-nix.lib.mkConfig packages {
                programs = {
                  serena.enable = true;
                };
              };
            in ''
              if [ -L ".mcp.json" ]; then
                unlink .mcp.json
              fi
              ln -sf ${config} .mcp.json

              lefthook check-install || lefthook install
            '';
          };
        };
      }
    );
}
