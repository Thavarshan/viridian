{ config, lib, pkgs, ... }:

{
  imports = [ ./nix/tasks.nix ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    directory = ".";
    npm.enable = true;
    npm.install.enable = false;
    lsp.enable = false;
  };

  languages.python = {
    enable = true;
    version = "3.13";
    directory = "apps/agent-api";
    venv.enable = true;
    uv = {
      enable = true;
      sync = {
        enable = true;
        allGroups = true;
      };
    };
  };

  packages = with pkgs; [
    actionlint
    clang
    curl
    git
    gnumake
    nixfmt-rfc-style
    pkg-config
    sqlite
  ] ++ lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ];

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16;
    listen_addresses = "127.0.0.1";
    hbaConf = ''
      local all all trust
      host all all 127.0.0.1/32 trust
      host all all ::1/128 trust
    '';
    initialDatabases = [
      { name = "wire"; user = "wire"; }
      { name = "wire_test"; user = "wire"; }
      { name = "wire_e2e"; user = "wire"; }
    ];
  };

  processes = {
    web = {
      exec = "node ace serve --hmr";
      cwd = "${config.git.root}/apps/web";
      after = [ "devenv:processes:postgres" "migrate:web" ];
      shutdown = { signal = 15; grace = 10; };
    };

    agent-api = {
      exec = "uv run --locked agent-api";
      cwd = "${config.git.root}/apps/agent-api";
      watch = {
        paths = [ ./apps/agent-api/src ];
        extensions = [ "py" ];
        ignore = [ "__pycache__" ];
      };
      shutdown = { signal = 15; grace = 10; };
    };
  };

  outputs.agent-api = config.languages.python.import ./apps/agent-api { };
}
