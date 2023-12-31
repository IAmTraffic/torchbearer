import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class TorchbearerActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["torchbearer", "sheet", "actor"],
      // template: "systems/ivys_torchbearer/templates/actor/actor-sheet.hbs",
      // template: "systems/ivys_torchbearer/templates/actor/actor-sheet.html",
      width: 700,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/ivys_torchbearer/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    // return `systems/ivys_torchbearer/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'Character') {
    // if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'Monster') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareCharacterData(context) {
    // console.log(context.system.text_inventory.body)

    // prepareItemFieldsOnActor(context, this)

    return;
    //Old
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.TORCHBEARER.abilities[k]) ?? k;
    }

    // async function prepareItemFieldsOnActor(context, sheetData){
    //   for(let i of context.items){      
    //     if(i.type === "Spell"){
    //       $("document").ready(() => {
    //         //TODO: this only works the second time you open the character sheet? if you refresh, it won't find the itemCheckboxOnActor elements
    //         // console.log(sheetData.form)
    //         // console.log(document.getElementsByClassName("itemCheckboxOnActor"))
    //         // console.log($(".itemCheckboxOnActor"))
    //         // console.log(document.getElementsByName("itemCheckboxOnActor." + i._id + ".system.memorized"))
    //         // console.log("itemCheckboxOnActor." + i._id + ".system.memorized")
    //         if(document.getElementsByName("itemCheckboxOnActor." + i._id + ".system.memorized").length === 1){
    //           document.getElementsByName("itemCheckboxOnActor." + i._id + ".system.memorized")[0].checked = sheetData.actor.items.get(i._id).system.memorized;
    //         }
    //         if(document.getElementsByName("itemCheckboxOnActor." + i._id + ".system.in_spellbook").length === 1){
    //           document.getElementsByName("itemCheckboxOnActor." + i._id + ".system.in_spellbook")[0].checked = sheetData.actor.items.get(i._id).system.in_spellbook;
    //         }
    //       })
    //     }
    //   }
    // }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    if(context.actor.type === "Character"){
      let spells = [];
      let invocations = [];
      let features = [];
      let weapons = [];
      let allies_and_enemies = [];
      let skills = [];

      for(let i of context.items){
        i.img = i.img || DEFAULT_TOKEN;
        
        if(i.type === "Spell"){
          spells.push(i)
        }else if(i.type === "Invocation"){
          invocations.push(i)
        }else if(i.type === "Level Feature"){
          features.push(i)
        }else if(i.type === "Weapon"){
          weapons.push(i)
        }else if(i.type === "NPC"){
          allies_and_enemies.push(i)
        }else if(i.type === "Skill"){
          skills.push(i)
        }
      }

      context.spells = spells
      context.invocations = invocations
      context.features = features
      context.weapons = weapons
      context.allies_and_enemies = allies_and_enemies
      context.skills = skills
    }else if(context.actor.type === "Grind"){
      let actors = [];
      

      context.actors = actors;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    //Delete Actor from Grind
    html.find(".grindActorDeleteButton").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let update = {};
      update["system.actor_list.-=" + li.data("itemId")] = null;
      this.actor.update(update)
      li.slideUp(200, () => this.render(false));
    })

    ////Advancing / Decreasing Grind
    //Advancing
    html.find(".advanceGrind").click(ev => {
      this.actor.update({"system.turn": (this.actor.system.turn + 1) % 5})
    })
    //Decreasing
    html.find(".decreaseGrind").click(ev => {
      this.actor.update({"system.turn": this.actor.system.turn - 1})
    })

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  //Credit to ChaosOS on the FoundryVTT Discord for much of this
  async _onDropActor(event, data) {
    //Returns false if this isn't the Grind type of Actor
    if(!(this.actor.type === "Grind")) return false

    // Returns false if user does not have
    if (!super._onDropActor(event, data)) return false
    // owners permissions of the organization
    const dropActor = await fromUuid(data.uuid);

    //if not already on list
    if(Object.keys(this.actor.system.actor_list).includes(dropActor._id)) return true

    //create new list item (only used because Foundry doesn't like having arrays in system. we are just going to use the Object.keys(system.actor_list) as our array)
    let new_actor = {}

    //add to list
    this.actor.system.actor_list[dropActor._id] = new_actor;

    this.actor.update({"system.actor_list": this.actor.system.actor_list});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      dataset.baseDice = 0;

      if(this.actor.system.abilities.raw_abilities[dataset.roll]){
        dataset.baseDice = this.actor.system.abilities.raw_abilities[dataset.roll].rating;
      }else if(this.actor.system.abilities.town_abilities[dataset.roll]){
        dataset.baseDice = this.actor.system.abilities.town_abilities[dataset.roll].rating;
      }else if(this.actor.system.skills[dataset.roll]){
        dataset.baseDice = this.actor.system.skills[dataset.roll].rating;
      }


      const dialog_content = await renderTemplate("systems/ivys_torchbearer/templates/rolls/roll-build-dialog.hbs", dataset);

      new Dialog({
        title: "Test Title",
        content: dialog_content,
        buttons: {
          button1: {
            label: "Roll",
            callback: (html) => roll_dialog_callback(html, dataset, this.actor),
            icon: `<i class="fas fa-check"></i>`
          },
          button2: {
            label: "Cancel",
            callback: () => {},
            icon: `<i class="fas fa-times"></i>`
          }
        }
      }).render(true);

      async function roll_dialog_callback(html, roll_dialog_data, actor){
        const ob = parseInt(html.find("input#ob").val());
        const miscDice = parseInt(html.find("input#miscDice").val());
        const miscSuccesses = parseInt(html.find("input#miscSuccesses").val());
        const baseDice = parseInt(roll_dialog_data.baseDice);
        const totalDice = baseDice + miscDice;

        // let label = dataset.label ? `[ability] ${dataset.label}` : '';
        let label = "";
        if(roll_dialog_data.label){
          label = label.concat(`Rolling ${roll_dialog_data.label}: ${totalDice}D`);
        }
        if(miscSuccesses){
          label.concat(` +${miscSuccesses}S`);
        }

        let formula = `{${totalDice}d6cs>3}>=ob`;

        let roll = new Roll(formula, actor.getRollData());

        await roll.evaluate();

        let rolled_successes = 0;
        let dice = [];

        roll.dice[0].results.forEach((die) => {
          rolled_successes += die.count;
          dice.push(die);
        });

        let succeeded = false;
        let successes = rolled_successes;
        if(rolled_successes >= ob){
          succeeded = true;
          successes += miscSuccesses;
        }

        let message_data = {
          ob: ob,
          dice: totalDice,
          additional_successes: miscSuccesses,
          label: label,
          formula: formula,
          rolled_successes: rolled_successes,
          miscSuccesses: miscSuccesses,
          succeeded: succeeded,
          successes: successes,
          dice: dice
        }
        const chat_message_content = await renderTemplate("systems/ivys_torchbearer/templates/rolls/roll-chat_message.hbs", message_data);
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({actor: actor}),
          content: chat_message_content,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL
        });

        // roll.toMessage({
        //   speaker: ChatMessage.getSpeaker({ actor: actor }),
        //   flavor: label,
        //   rollMode: game.settings.get('core', 'rollMode'),
        // });
        return roll;
      }

    }
  }

  /*TODO: Make items items*/
  // /** @override */
  // async _onDrop(event) {
  //   let oldData = TextEditor.getDragEventData(event);
  //   let oldId = null;
  //   if(oldData.data){
  //     oldId = oldData.data._id;
  //   }

  //   let item = await super._onDrop(event);    //This is an essential step (the below code doesn't seem to be a proper substitute), but it creates the new item instead of updating it?? idk
    
  //   let newId = Array.isArray(item) ? item[0]._id : item._id;

  //   // super._onDrop sometimes returns an array (e.g. drop from compendium) and sometimes not (e.g. move in inventory)
  //   if (Array.isArray(item)) {
  //     return item.map(async (i) => await this.handleDropItem(i, event, oldId));
  //   } else {
  //     return await this.handleDropItem(item, event, oldId);
  //   }
  // }

  // async handleDropItem(item, event, oldId) {
  //   // item.document means we got an ItemData rather than a TorchbearerBaseItem
  //   const tbItem = item.document ? item.document : item;
  //   if (tbItem instanceof TorchbearerItem) {
  //     if (tbItem.data) {
  //       await tbItem.syncEquipVariables();

  //       let oldContainerId = tbItem.data.data.containerId;
  //       let { containerType, containerId, slotsTaken } = this.closestCompatibleContainer(tbItem, event.target); //the data of where we are dropping?
  //       if (!containerType) {
  //         //No closest container specified, so pick one.
  //         // First, we know it's not pack w/o a containerId, so if it is the item's gonna need
  //         // updating.
  //         if (tbItem.data.data.equip === "Pack") {
  //           tbItem.data.data.equip = tbItem.data.data.equipOptions.option1.value;
  //           tbItem.data.data.slots = tbItem.data.data.slotOptions.option1.value;
  //           containerType = tbItem.data.data.equip;
  //           containerId = null;
  //           slotsTaken = tbItem.data.data.slots;
  //         }
  //         let newContainerType = this.pickAnotherContainerIfNecessaryDueToItemSize(tbItem);
  //         if (newContainerType) {
  //           slotsTaken = tbItem.slotsTaken(newContainerType);
  //           containerType = newContainerType;
  //         }
  //       }

  //       if (containerType) {
  //         let update = { data: { equip: containerType, containerId: containerId, slots: slotsTaken } };
  //         await tbItem.update(update);
  //         await tbItem.onAfterEquipped({ containerType, containerId });
  //         this.actor._onUpdate({ items: true }, { render: true });
  //         if (oldContainerId) {
  //           let oldContainer = this.actor.items.get(oldContainerId);
  //           setTimeout(() => {
  //             oldContainer.sheet.render(false);
  //           }, 0);
  //         }
  //         if (containerId) {
  //           let newContainer = this.actor.items.get(containerId);
  //           setTimeout(() => {
  //             newContainer.sheet.render(false);
  //           }, 0);
  //         }
  //       }

  //       //Delete the item from the old container
  //       if(oldContainerId){
  //         this.actor.removeItemFromInventory(oldId, oldContainerId);
  //       }
  //     }
  //   }

  //   return tbItem;
  // }

}
