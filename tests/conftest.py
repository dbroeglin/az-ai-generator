import pytest
import shutil
import subprocess


@pytest.fixture(scope="class")
def solution_dir(tmp_path_factory):
    dir = tmp_path_factory.mktemp("base") / "test-solution"
    # execute a multi-line shell command
    env_name = "pyt-003"
    location = "francecentral"
    resource_group_name = f"rg-{env_name}"
    subprocess.run(
        f"aigbb-generator-test '{dir.resolve()}' 100", shell=True, check=True
    )
    subprocess.run(
        f"az group create --location {location} --name {resource_group_name}", shell=True, check=True
    )
    subprocess.run(
        f"cd {dir.resolve()}; azd env new {env_name}", shell=True, check=True
    )
    subprocess.run(
        f"cd {dir.resolve()}; azd env set AZURE_RESOURCE_GROUP {resource_group_name}", shell=True, check=True
    )
    subprocess.run(
        f"cd {dir.resolve()}; azd env set AZURE_LOCATION {location}", shell=True, check=True
    )
    yield dir.resolve()

    subprocess.run(
        f"cd {dir.resolve()}; azd down --purge --force --no-prompt || true", shell=True, check=True
    )
    subprocess.run(
        f"az group delete --name {resource_group_name} --yes || true", shell=True, check=True
    )
    shutil.rmtree(dir)
