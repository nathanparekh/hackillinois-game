"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let content_object;
// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    let system_prompt = {
        role: "system",
        content: "You are a master storyteller, skilled in creating fun stories with adventuring spirit. " +
            "You are telling a story that eventually builds up to a fight with a dragon. " +
            "You cannot repeat a the same line twice. You will address the story to the party. " +
            "You will address actions to a person."
    };
    let results = [];
    let story_messages = [];
    // random number between 12 and 18 inclusive
    let dragon_intro = Math.floor(Math.random() * (18 - 12 + 1)) + 12;
    // random number between 2 and 5 inclusive
    let dragon_fight = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
    let dragon_active = false;
    // create player_stats with 100 health and 35 strength
    let player_stats = {
        health: 100,
        defense: 0,
        strength: 1
    };
    // create dragon_stats with random health between 150 and 200 inclusive
    let dragon_stats = {
        health: Math.floor(Math.random() * (200 - 150 + 1)) + 150,
        strength: 1.2
    };
    let i = 0;
    function get_update() {
        return __awaiter(this, void 0, void 0, function* () {
            // for each item in story_messages, convert it to {"role":"user", "content": message}
            let prompt = story_messages.map(message => ({
                role: "user",
                content: message
            }));
            let start_user_prompt = {
                role: "user",
                content: 'Prompt line ' + String(i + 1) + ' of the story in one sentence. ' +
                    'Do not include any enemies in this response or the actions. ' +
                    'Do not copy the prompt example. ' + 'Avoid repetition. ' +
                    'Also provide 3 potential actions that the current player could take. ' +
                    'Also provide a 1-sentence description of what occurs if that action is taken, including what opponents, if any, might do. ' +
                    'Return the entire response as a JSON object like this one: {"story":"Suddenly, a massive, crimson-scaled dragon unfurls its wings and screeches into the sky, its fiery breath whipping through the air, sparking a fiery blaze in the cold stark glen.","actions":[{"name":"Arcane Blast","change_in_enemy_health":40,"change_in_player_health":0,"change_in_team_health":0,"player_defense_boost":0,"team_defense_boost":0,"description":"You summon a burst of arcane energy, blasting the dragon and causing significant damage. Your teammates get burned in the process."},{"name":"Aimed Arrow","change_in_enemy_health":30,"change_in_player_health":0,"change_in_team_health":0,"player_defense_boost":0,"team_defense_boost":0,"description":"You fire an arrow at the dragon, striking and damaging it."},{"name":"Divine Shield","change_in_enemy_health":0,"change_in_player_health":0,"change_in_team_health":0,"player_defense_boost":30,"team_defense_boost":30,"description":"You summon a divine shield that significantly increases your party\'s defense."}]} ' +
                    'At least 2 statistics should be unchanged for each action. Do not change any statistic by more than 45. Let positive values for change in health represent healing, and negative values represent damage. Use the new_enemy key to represent a change in the enemy (for example, when the dragon is introduced) but otherwise do not include it.'
            };
            let run_user_prompt = {
                role: "user",
                content: 'Prompt line ' + String(i + 1) + ' of the story in one sentence. ' +
                    'Do not include any enemies in this response or the actions. ' +
                    'o not copy the prompt example. Avoid repetition. ' +
                    'Also provide 3 potential actions that the current player could take. ' +
                    'Also provide a 1-sentence description of what occurs if that action is taken, including what opponents, if any, might do. ' +
                    'Return the entire response as a JSON object like this one: {"story":"Suddenly, a massive, crimson-scaled dragon unfurls its wings and screeches into the sky, its fiery breath whipping through the air, sparking a fiery blaze in the cold stark glen.","actions":[{"name":"Arcane Blast","change_in_enemy_health":40,"change_in_player_health":0,"change_in_team_health":0,"player_defense_boost":0,"team_defense_boost":0,"description":"You summon a burst of arcane energy, blasting the dragon and causing significant damage. Your teammates get burned in the process."},{"name":"Aimed Arrow","change_in_enemy_health":30,"change_in_player_health":0,"change_in_team_health":0,"player_defense_boost":0,"team_defense_boost":0,"description":"You fire an arrow at the dragon, striking and damaging it."},{"name":"Divine Shield","change_in_enemy_health":0,"change_in_player_health":0,"change_in_team_health":0,"player_defense_boost":30,"team_defense_boost":30,"description":"You summon a divine shield that significantly increases your party\'s defense."}]} ' +
                    'At least 2 statistics should be unchanged for each action. Do not change any statistic by more than 45. Let positive values for change in health represent healing, and negative values represent damage.'
            };
            prompt.splice(0, 0, system_prompt);
            // push start_user_prompt if i < 2, else run_user_prompt
            if (i < 2) {
                prompt.push(start_user_prompt);
            }
            else {
                prompt.push(run_user_prompt);
            }
            if (i < dragon_intro) {
                prompt.splice(1, 0, { role: "system", content: "Do not mention the dragon." });
            }
            else if (i < dragon_fight) {
                prompt.splice(1, 0, {
                    role: "system",
                    content: "You can start building up to the dragon, but do not come into contact with it."
                });
            }
            else {
                // search for the word dragon in the last 4 entries of story_messages
                if (!dragon_active) {
                    dragon_active = true;
                }
                let lastFourMessages = story_messages.slice(-4);
                let dragonIndex = lastFourMessages.findIndex(message => message.includes("dragon"));
                if (dragonIndex !== -1) {
                    prompt.splice(1, 0, { role: "system", content: "The dragon is aggressive." });
                }
            }
            let completion;
            yield fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    response_format: { "type": "json_object" },
                    messages: prompt
                }),
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-type": "application/json",
                }
            }).then((response) => response.json())
                .then((json) => (completion = json));
            console.log(completion.choices[0]);
            content_object = JSON.parse(completion.choices[0].message.content);
            results.push(content_object);
            story_messages.push(content_object.story);
            let image_response;
            yield fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: "8-bit retro style image: ".concat(content_object.story),
                    size: "1792x1024",
                }),
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-type": "application/json"
                }
            }).then((response) => response.json())
                .then((json) => (image_response = json));
            // @ts-ignore
            let image_url = image_response.data[0].url;
            console.log(image_url);
            // change the id main-img to use the image_url
            document.getElementById('main-img').setAttribute('src', image_url);
            // change main-story to use the story
            document.getElementById('main-story').innerText = content_object.story;
        });
    }
    function make_selection(idx) {
        // randomly choose one of the actions
        let selected_action = content_object.actions[idx];
        story_messages.push(selected_action.description);
        console.log(story_messages);
        let mult_player_health = dragon_active ? (selected_action.change_in_player_health * dragon_stats.strength) : selected_action.change_in_player_health;
        let eff_health_change = mult_player_health + Math.max(player_stats.defense, 0);
        player_stats.health = player_stats.health + eff_health_change;
        player_stats.defense = selected_action.player_defense_boost;
        if (dragon_active) {
            dragon_stats.health = player_stats.strength * selected_action.change_in_enemy_health;
        }
        if (player_stats.health <= 0) {
            console.log("loss");
            process.exit();
        }
        if (dragon_stats.health <= 0) {
            console.log("win");
            process.exit();
        }
        i++;
        get_update();
    }
    get_update();
    // JavaScript to handle button interactions or any other dynamic behavior
    document.getElementById('choice1').addEventListener('click', function () {
        console.log('Choice 1 selected');
        make_selection(0);
    });
    document.getElementById('choice2').addEventListener('click', function () {
        console.log('Choice 2 selected');
        make_selection(1);
        // Add your logic for choice 2 here
    });
    document.getElementById('choice3').addEventListener('click', function () {
        console.log('Choice 3 selected');
        make_selection(2);
        // Add your logic for choice 3 here
    });
});
//# sourceMappingURL=script.js.map