from scripts.helpful_scripts import get_account
from brownie import config, network, SocialNetwork
import os
import shutil


def deploy(update_frontend=False):
    account = get_account()
    social_network = SocialNetwork.deploy(
        {'from': account},
        publish_source=config["networks"][network.show_active()].get("verify", False)
    )
    if update_frontend:
        update_front_end()
    return social_network


def update_front_end():
    # Send the build folder
    src = "./build"
    dest = "./frontend/src/chain-info"
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    print("Front end updated!")


def main():
    deploy(update_frontend=True)
