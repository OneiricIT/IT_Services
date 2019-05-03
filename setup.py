# -*- coding: utf-8 -*-
from setuptools import setup, find_packages
import re, ast

# get version from __version__ variable in australian_accounts/__init__.py
_version_re = re.compile(r'__version__\s+=\s+(.*)')

with open('it_services/__init__.py', 'rb') as f:
    version = str(ast.literal_eval(_version_re.search(
        f.read().decode('utf-8')).group(1)))

with open('requirements.txt') as f:
        install_requires = f.read().strip().split('\n')

setup(
	name='it_services',
	version=version,
	description='IT Services app',
	author='Oneiric Group Pty Ltd',
	author_email='erp@oneiric.com.au',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
