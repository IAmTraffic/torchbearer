/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/ivys_torchbearer/templates/actor/parts/actor-features.hbs",
    "systems/ivys_torchbearer/templates/actor/parts/actor-items.hbs",
    "systems/ivys_torchbearer/templates/actor/parts/actor-spells.hbs",
    // "systems/ivys_torchbearer/templates/actor/parts/actor-effects.hbs",
    "systems/ivys_torchbearer/templates/rolls/roll-build-dialog.hbs",

    //Item partials
    "systems/ivys_torchbearer/templates/item/parts/item-inventory.hbs",
    
    // "systems/ivys_torchbearer/templates/actor/parts/actor-features.html",
    // "systems/ivys_torchbearer/templates/actor/parts/actor-items.html",
    // "systems/ivys_torchbearer/templates/actor/parts/actor-spells.html",
    // "systems/ivys_torchbearer/templates/actor/parts/actor-effects.html",
  ]);
};
