class Command {

  constructor (meta) {
    this.name = meta.name;
    this.meta = meta;
  }

  execute (msg, args) {
    throw new TypeError(`Abstract method 'execute' not implmentented in '${this.name}'`);
  }

}

module.exports = Command;
