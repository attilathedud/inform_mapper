from setuptools import setup

setup(
    name='inform_mapper',
    packages=['inform_mapper'],
    include_package_data=True,
    install_requires=[
        'flask'
    ],
    setup_requires=[
        'pytest-runner',
    ],
    tests_require=[
        'pytest',
    ],
)
