from fabric.contrib.files import exists
from fabric.api import env, run, local

REPO_URL = 'git@github.com:alamastor/wind-visr.git'


def deploy():
    source_dir = '/home/%s/wind-vis' % env.user
    _get_latest_source(source_dir)
    _npm_update(source_dir)
    _npm_build(source_dir)


def _get_latest_source(source_dir):
    if exists(source_dir + '/.git'):
        run('cd %s && git fetch' % source_dir)
    else:
        run('git clone %s %s' % (REPO_URL, source_dir))
    current_commit = local('git log -n 1 --format=%H', capture=True)
    run('cd %s && git reset --hard %s' % (source_dir, current_commit))


def _npm_update(source_dir):
    run('cd %s && npm update' % source_dir)


def _npm_build(source_dir):
    run('cd %s && npm run build' % source_dir)
