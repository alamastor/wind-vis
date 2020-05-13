from fabric import task
from patchwork.files import exists

REPO_URL = 'git@github.com:alamastor/wind-visr.git'


@task
def deploy(c):
    update_source(c)
    npm_update(c)
    npm_build(c)

@task
def update_source(c):
    source_dir = get_source_dir(c)
    if exists(c,source_dir + '/.git'):
        c.run('cd %s && git fetch' % source_dir)
    else:
        c.run('git clone %s %s' % (REPO_URL, source_dir))
    current_commit = c.local('git log -n 1 --format=%H', hide=True).stdout
    c.run(f'cd {source_dir} && git reset --hard {current_commit}')


@task
def npm_update(c):
    source_dir = get_source_dir(c)
    c.run('cd %s && npm ci' % source_dir)


@task
def npm_build(c):
    source_dir = get_source_dir(c)
    c.run('cd %s && npm run build' % source_dir)


def get_source_dir(c):
    return f'~/sites/{c.host}'