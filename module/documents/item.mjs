/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class TorchbearerItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    //Make the calculations for skill rolls
    if(this.type === "Skill"){
      let dialog_content;
      let dataset = {
        "baseDice": 0,
        "label": item.name
      };

      if(this.system.beginners_luck){
        //Beginners Luck Stuff
        if(Object.keys(this.system.based_on_options).includes(this.system.based_on)){
          dataset.baseDice = this.parent.system.abilities.raw_abilities[this.system.based_on].rating
        }

        dialog_content = await renderTemplate("systems/ivys_torchbearer/templates/rolls/roll-build-dialog-beginners_luck.hbs", dataset);
      }else{        
        dataset.baseDice = this.system.rating
      
        dialog_content = await renderTemplate("systems/ivys_torchbearer/templates/rolls/roll-build-dialog.hbs", dataset);
      }


      new Dialog({
        title: "Rolling " + this.name,
        content: dialog_content,
        buttons: {
          button1: {
            label: "Roll",
            callback: (html) => roll_dialog_callback(html, dataset, this.actor, this.system.beginners_luck),
            icon: `<i class="fas fa-check"></i>`
          },
          button2: {
            label: "Cancel",
            callback: () => {},
            icon: `<i class="fas fa-times"></i>`
          }
        }
      }).render(true);

      async function roll_dialog_callback(html, roll_dialog_data, actor, beginners_luck){
        const ob = parseInt(html.find("input#ob").val());
        const miscDice = parseInt(html.find("input#miscDice").val());
        const miscSuccesses = parseInt(html.find("input#miscSuccesses").val());
        const baseDice = parseInt(roll_dialog_data.baseDice);
        let totalDice = 0;
        if(beginners_luck){
          const miscDiceHalved = parseInt(html.find("input#miscDiceHalved").val());
          totalDice = Math.ceil((baseDice + miscDiceHalved) / 2.0) + miscDice
        }else{
          totalDice = baseDice + miscDice;
        }

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







      return;
    }

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
