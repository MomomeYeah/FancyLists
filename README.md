FancyLists
==========

This is mostly a learning experience to learn Django but also to solve that problem of having to write shopping lists in plain text...the horror!

## Development Setup

* run `vagrant up` to provision an Ubuntu VM and run setup script
* login to VM via `vagrant ssh`
* `cd /vagrant`
* fill in the appropriate values in settings/secrets.json
* start the Django server with `python3 manage.py runserver 0.0.0.0:8000`
* on your host machine, navigate to `localhost:8090`
* once you're done, `vagrant suspend` to the stop the VM


## TODO

* Deletes happen in modal dialogues?
* Save user settings, i.e. which categories are expanded/collapsed, which list was last being edited, etc.
* Create items against categories, on index add item check item category matches
