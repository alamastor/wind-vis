#!/bin/bash
pyenv global 3.8.1
pip install fabric
pip install patchwork
openssl aes-256-cbc -K $encrypted_5a6a599da1a1_key -iv $encrypted_5a6a599da1a1_iv -in deploy_scripts/id_ed25519.enc -out deploy_scripts/id_ed25519 -d
cd deploy_scripts && fab -H${DEPLOY_USER}@${DEPLOY_HOST} -iid_ed25519 deploy