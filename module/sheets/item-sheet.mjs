/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class TorchbearerItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["torchbearer", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/ivys_torchbearer/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    switch (this.item.type){
      case "Spell":
        return `${path}/item-spell-sheet.hbs`;
      case "Invocation":
        return `${path}/item-invocation-sheet.hbs`;
      case "Level Feature":
        return `${path}/item-feature-sheet.hbs`;
      case "Weapon":
        return `${path}/item-weapon-sheet.hbs`;
      case "NPC":
        return `${path}/item-npc.hbs`;
      case "Skill":
        return `${path}/item-skill.hbs`;
      default:
        return `${path}/item-sheet.hbs`;
    }

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    // return `${path}/item-${this.item.type}-sheet.hbs`;
    // return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
    html.find("input").on("change", ev => {
      if(this.actor !== null){
        this.actor.sheet.getData()  //Jog the update in the owning actor sheet
      }
    })
  }
}
