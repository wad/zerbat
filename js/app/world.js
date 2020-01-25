define([
    'app/constants',
    'app/gameContext'], function (c, gx) {

    var World = {};

    World.getTerrainDescription = function (terrainType, weather, currentDate) {
        var sky = c.determineSkyLightness(currentDate);
        var options = ['foo'];
        switch (terrainType) {
            case c.TERRAIN_TYPE_UNKNOWN:
                options = ["It's very strange, but you can't tell anything at all about this place."];
                break;
            case c.TERRAIN_TYPE_SHORE:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'A cool breeze is blowing onshore. The stars overhead shine brightly, picking out highlights on the small waves crashing against the sandy beach.',
                                    'The rocky shore is chilly in the night air. The moonlight shines brightly on the waves.',
                                    'It\'s very dark, but the stars light up some of the waves, breaking on the rocks.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'There\'s a warm breeze, but the clouds are covering any stars. You can hear waves breaking against the beach.',
                                    'The air is still, it\' very dark, but your can hear the sea lapping softly against the rocky shore.',
                                    'You can\'t see much of anything, but by the sound of it, there is a shore nearby.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The howling wind tears at you, as you stare out over a frenzied ocean, illuminated by frequent lightning strikes.',
                                    'Lightning and thunder crashes around you, as you stand on the rocky shore, just out of reach of enormous waves.',
                                    'Large waves, driven by the fury of the wind, crash on the beach, occasionally illuminated by lightning flashes.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is just rising in the east, and the breeze from the ocean is cold. Large waves crash against the rocky shore.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Somewhere behind the clouds, the sun is coming up. The ocean is calm and cool, breaking quietly on the rocks.',
                                    'It\'s a pretty sunrise, shining with many colors through the clouds. The ocean is peaceful, lapping on the sandy beach.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The howling wind tears at you, as you stare out over a frenzied ocean, illuminated by frequent lightning strikes. The sun is struggling to rise, somewhere.',
                                    'Lightning and thunder crashes around you, as you stand on the rocky shore, just out of reach of enormous waves. The sky in the east is getting brighter.',
                                    'Large waves, driven by the fury of the wind, crash on the beach, occasionally illuminated by lightning flashes. It\'s getting a little brighter.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is shining brightly on the hot sand. The ocean is still.',
                                    'There are no clouds in the sky. The rocky shore is hot, the waves crash sending soothing spray in your direction.',
                                    'Large piles of seaweed on the beach sparkle and steam in the sun. Clouds of small flies hover around them.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sky is a dark grey, the same color as the ocean, stretching out from the grey sands of the beach in front of you.',
                                    'Seabirds call in the air, circling something rotting just past the breaking waves. It\'s a cloudy day.',
                                    'The air is heavy with impending rain. Large waves smash themselves against boulders.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain is pouring down, with occasional lightning flashing somewhere in the clouds. The waves smash the rocks.',
                                    'Thunder and lightning collide above the heaving sea, as sheets of rain dump all around. It\'s impossible to stay dry.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The gorgeous sunset paints the ocean with a marvelous canvas of color. Seabirds call and circle overhead. You see a crab hiding behind a rock.',
                                    'The beach is peaceful and warmed by the setting sun.',
                                    'The sun lowers itself reluctantly towards the horizon, as waves lap against the rocky shore. Stars begin to appear.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Somewhere behind the clouds, the sun must be going down, because it\'s getting darker. The waves are crashing on the sand.',
                                    'The sunset shines through the heavy clouds. The salty breeze carries strange scents across the shore.',
                                    'Another sunset, you never get tired of them. The rocky shore is getting dimmer.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The howling wind tears at you, as you stare out over a frenzied ocean, illuminated by frequent lightning strikes. The sun toppling into the horizon, somewhere beyond the black clouds.',
                                    'Lightning and thunder crashes around you, as you stand on the rocky shore, just out of reach of enormous waves. The sky in the west is getting dimmer.',
                                    'Large waves, driven by the fury of the wind, crash on the beach, occasionally illuminated by lightning flashes. It\'s getting a little dimmer, it will be dark very soon.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_OCEAN:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The infinite stars sparkle against the endless ocean, stretching away in all directions.',
                                    'Waves heave and surge, but you keep getting distracted by all the twinkling stars in the sky.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is too dark to see much, but you hear the moving water all around you.',
                                    'Somewhere behind the clouds there are stars. The ocean is all around.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Enormous waves crash all around you, as lightning flashes overhead.',
                                    'Sheets of rain dump down on you, and on the surrounding ocean.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises, reflecting off the ocean to the East. The stars are fading overhead.',
                                    'The rising sun reflects off the ocean.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The day is beginning. The ocean is grey, the same color as the sky overhead.',
                                    'The rising sun shines through the thick cloud layer. Grey ocean surrounds you, swelling and heaving.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The lightning flashes and pouring rain are not amused by the rising sun. Waves heave and froth all around.',
                                    'The sun rises despite the storm. The sea is the color of lead, with enormous waves crashing all around.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun shines, sparkling off the waves of a bright blue ocean. Gulls circle overhead.',
                                    'The waves are blue, with little white caps on them. The sky is bright blue, with a hot yellow sun.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sky is grey, and so are the waves. The wind is blowing, and it feels a bit like rain.',
                                    'The steel grey sky seems to scowl at the calm, grey sea. Grey gulls circle and peer at you from above.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The waves toss and fling themselves about, and the wind howls, and rain drives horizontally, soaking you to the bone.',
                                    'Huge waves roll past and the churning sky pours out water into the sea.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'You enjoy a lovely sunset over the ocean. The sky is clear, and you can just see the brightest stars overhead.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun is setting over the waves, barely visible through the clouds.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The waves pound and hiss, as rain pelts them. The sun is setting somewhere to the west. It\'s getting dark fast, and the temperature is dropping.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_MTN_OVER_PLAINS:
            case c.TERRAIN_TYPE_MTN_OVER_PINE:
            case c.TERRAIN_TYPE_MTN_OVER_DESERT:
            case c.TERRAIN_TYPE_MTN_OVER_JUNGLE:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'At this high altitude, the stars are especially bright.',
                                    'The sun is down, and the stars are out. It is very clear, and from this high up, you can see more stars than usual.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It\'s extremely dark, high in the mountains on a cloudy night.',
                                    'The night is dark in the mountains, with clouds covering the night sky.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Lightning flashes right above your head, and rain beats down. You see the lightning strike a nearby jutting stone.',
                                    'Rain pours down, and wind blows in gusts, trying to push you off the mountainside. It is very dark, except when the lightning flashes above.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises in the mountains, but you cannot see it yet, as you are in a ravine at present.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It looks like it might rain, this grey, clammy morning in the mountains.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain dumps all around, making little temporary rivers in the surrounding mountains.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The hot sun overhead beats down. You can see for a long way, due to your high altitude.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is rather pleasant this overcast day in the mountains.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain comes down in sheets, as lightning snaps and jabs at the surrounding mountain peaks.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'You get a great view of the setting sun from the mountaintops.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The setting sun is mostly hidden by clouds, but you can see where it is through a crack in the surrounding mountains.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'A raging storm makes it impossible to enjoy the sunset. Lightning strikes a nearby mountain peak.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_PLAIN:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The open plain is illuminated by millions of sparkling stars overhead.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The grassy plains are very dark at night, when it\'s cloudy like this.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Sheets of rain pour down all around you, watering the grassy plains. It is dark, with occasional lightning to brighten things up.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises over the wide, grassy plains. One by one, the stars go out.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'You cannot see where the sun is rising, due to the clouds. The plains are wide and covered with dense grass.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The winds blow, and the rain dumps on you, as the sun rises above the grassy plains.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sky is broad, with hardly anything breaking the endless circle of horizon around you. It is a warm, sunny day.',
                                    'Grasslands stretch out in all directions. The blue sky overhead is free of any clouds.',
                                    'The plains are mostly flat, with rolling dunes covered with pale grass. The sun is hot overhead.',
                                    'It\'s a hot day, with a bright sun burning down on you. You are in flat grassy plains.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Clouds loom and threaten over the grass, but no rain comes.',
                                    'The grassy plains stretch on and on, undulating slightly in the breeze. It is cloudy, for which you are grateful.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain pours on your head, and waters the grass all around you.',
                                    'It is stormy on the grassy plains. Maybe by tonight it will let up.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun sets on this clear, crisp day on the grassy plains.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'You cannot see the sunset very well, due to the clouds, but the grassy plains are becoming dark fast.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The storm continues to crash and blow, whipping the poor grass in all directions, as the sun sets, exhausted.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_PINE_FOREST:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The tall pines surround you, as the night bugs sing.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is pitch black under the pines on a cloudy night.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rain tumbles down, smelling of pine. It is very dark.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises to the east, peeking through the pines.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun rises to the east, showing through the clouds, somewhat obscured by the tall pines all around.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The storm thrashes the pine branches around you, as the sun struggles to rise in the easy. You are getting rained upon.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'You can practically hear the sap flowing through the pine trees all around you, as the bright sun overhead heats up the needles.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is a nice, overcast day among the pines of the forest.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain falls all around, washing dust off the pines.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'You enjoy a sun setting between pine trees, a good end to this fine, clear, day.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Night is approaching rapidly among the tall pines. The sky is cloudy, and it will be very dark soon.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain falls on the pines all around you, as the sun sets.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_LAKE:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The fresh water of the lake reflects perfectly the myriad stars above.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The water of the lake is as black as the night sky above.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain pours on you, plinking steadily on the surrounding lakewater, though you cannot see it as it is so dark.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'You enjoy a pretty sunrise over the lake.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun is rising over the lake, though you cannot really see it through the clouds.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The storm prevents you from seeing the sunrise over the lake.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The shining sun overhead allows you to see deep into the lakewater below.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is a cloudy day, and the lake is calm today.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Steep, freshwater waves sweep from one end of the lake to the other, as rain splashes down.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun sets peacefully over the lake. Stars begin to peek out of the darkening sky.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun sets through the clouds over the lake.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'It is too rainy to see much, but there is a sunset over the lake, out there somewhere.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_RIVER:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'You hear the gurgling river tonight, as the stars glisten brightly overhead.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is very dark, but there is some sort of glowing fish species swimming around in the river tonight.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'It is dark and miserable, with rain pouring down on you, making the river swell its banks.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises brightly over the river.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The rising sun peeks through dense clouds, illuminating the surrounding river.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rain beats down on the river, and on the people on it.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'It is a shiny bright day on the river. The glowing yellow sun overhead, lets you see some fish in the swift water.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The cloudy sky is reflected dully in the muddy river water.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Lightning flashes and rain pours down, swelling the banks of the river.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'You grimace at yet another pretty sunset over the river.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The river glows golden in the sunset.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rain falls relentlessly on the river, as the sun gives up and goes to bed.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_JUNGLE:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The animals and insects of the jungle at night form an orchestra that is almost deafening.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is pitch black beneath the leafy jungle at night. Bugs are trying to bite you, they want your blood.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Driving rain pours on your head, as lightning flashes overhead. Large jungle leaves serve to store up water, so that it falls suddenly, in bucketfulls.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'It\'s a shiny, sweaty day in the steaming jungle, and the sun is still trying to rise in the east.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The clouds obscure the rising sun just as well as the surrounding jungle foliage.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'More rain in the jungle. Another rainy day. Ho hum. You are getting used to being wet all the time.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun shines overhead, making itself felt even through the dense jungle foliage.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Clouds mercifully cover the sun, though the jungle is still warm.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Lightning flashes and thunder crashes, echoing through the jungle.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun sets after another warm day in the deep jungle.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Another cloudy day ends in the steaming jungle.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Another stormy day in the jungle. The sun is trying to set, out there somewhere to the west.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_DESERT:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The desert is cold at night, but the stars are very bright.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Nighttime in the desert is very dark when it is cloudy. You cannot even see the snake in your boot.',
                                    'It is too dark to see anything in the desert at night, when it is so cloudy. You wish you could see the stars.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Wind howls, but it does not rain very much in the desert. You cannot see anything at all. The blowing sand and dirt doesn\'t help.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'Why is the sunrise in the desert so beautiful? It could be because of all the dust in the air.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'High altitude clouds seem to attract the rising sun. Hopefully it will be overcast today, the desert is too hot without cloud cover.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The winds blow clouds of dust in the desert. You wish it would rain, but that does not seem likely.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The burning sun scorches everything hapless enough to be in its glare. Including you. The desert sands burn everything that touches it.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'You are thankful for some cloud cover today. The desert is not a good place to be in sunshine.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'You wish the winds would stop. They blow sand and dirt into everything.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'A large sun is setting in the west. The desert radiates heat.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The setting sun shines through the cloud cover. The desert sands are still warm from the day, but they are cooling rapidly.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain spatters down sporadically, making big circles on the dusty desert ground. The wind whips and churns clouds in the sky. The sun sets.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_TOWN:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The town is dark and quiet, you can see stars overhead.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The town is dark and quiet, but you cannot see stars because it is cloudy.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain pours down among the buildings. A few windows are lit, but it\'s very dark.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises over some buildings on this clear, new day.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun rises over some buildings on this cloudy day.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain pours down, soaking the buildings around you. The sun is rising somewhere behind the clouds.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The weather is clear and warm. The shade of a nearby buildings is inviting.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The streets of the town are cool in the cloudy weather.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'People hurry about the town, trying to stay out of the rain.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is setting over some buildings in the town. Stars are starting to peek out in the darkening sky.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is cloudy, a bit cool, and the sun is setting behind some buildings.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rain is coming down hard as the sun sets. The streets are full of puddles.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_AGRICULTURAL:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The fields of grain and vegetables around you can be seen, even by starlight.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Rows of corn loom up in front of you suddenly, in the deep darkness of night.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rain is watering the gardens around you, but you cannot see them because it is so dark.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises over the wheat fields nearby, turning them to gold. The sky is blue and clear.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The rising sun, shining through clouds, turns already gold wheat fields into an even golder color.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The wind blows hard, and rain pours down on the farms, this grey, chilly morning.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The fields of grain and vegetables around you can bask in the sunlight.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Fields of wheat and corn are all around you. The sky is cloudy overhead.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain dumps down, watering the corn fields nearby. It looks like it might stop raining soon, though, you might get a nice day out of it at some point.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun sets behind a row of corn, making it too bright to look in that direction.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is getting darker, so the sun must be going down, though you cannot see it due to cloud cover. The surrounding farmhouses start showing lights in the windows.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Lightning flashes in the roiling sky, and driving rain bends rows of corn low to the ground. The sun is going down, it is promising to be a miserable night for anyone stuck outdoors.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_CLIFFS:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The rugged, rocky cliffs around you can barely be seen by starlight.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'This terrain is far to dangerous to move about in, in the dark. There are cliffs everywhere.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'With the howling wind, driving rain, blackness of night, and steep cliffs surrounding you, you hesitate to even take a single step in any direction.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is rising in this rugged, cliffy area. It looks like it will be a nice day.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Clouds obscure the sun, gratefully. The rocks of the cliffs are warm to the touch.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rocky cliffs are slick with rainwater. It has been raining off and on for the past hour.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is bright, the sky clear. You are in a very rocky, rough area, with cliffs all around you.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is cloudy and cool.  You are in a very rocky, rough area, with cliffs all around you.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rain is coming down hard, making footing treacherous. You are in a very rocky, rough area, with cliffs all around you.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is setting in a clear sky. You are in a very rocky, rough area, with cliffs all around you.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun is setting in the cloudy sky. You are in a very rocky, rough area, with cliffs all around you.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'It is raining hard as the sun goes down. You are in a very rocky, rough area, with cliffs all around you.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_SWAMP:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sucking mud of the swamp is hard to see in the darkness. But you can smell it. The stars overhead provide some light.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'It is pitch black in the swamp at night, when the stars are covered by clouds.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain is falling softly all around you, mostly landing in mud and puddles of the swamp. Night creatures keep moving, just out of sight.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises over the stagnant pools of reeking water. It seems like the day will be clear. That should make you easy for the mosquitos to locate.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun rises in an appropriately cloudy sky. The swampland stretches out around you in all directions.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain falls in the swampland, as the sun rises in the east.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is shining brightly overhead, as you muck your way through the swamp. Bugs feast on your blood.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The clouds are covering the sun, as you make your way through the swamp.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain continues to fall into the swampy water around you. Evil-looking trees loom out of the mists from time to time.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun is setting in the swamp. Golden rays slice through the wan foliage and hanging moss.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'Heavy clouds cover the horizon. It must be sunset. The muddy swamp is depressing, as usual.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain lashes you, and gets you completely wet. The swampwater beneath your feet sucks at your soles. The sun dies in the west.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_LAVAFLOW:
                switch (sky) {
                    case c.SKY_NIGHT:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The black rocky ground of hardened lava is almost impassable by night. Stars shine overhead.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'With the night sky cloudy, and the black lava rock underfoot, you almost feel like you are inside a cave.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'The rain dumps on your head, as you stumble in the dark and bruise your shins on the sharp volcanic rock underfoot.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNRISE:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun rises in the east, over a desolate pile of black volcanic rock. You can see the volcano in the distance, smoke still pours out of the crater.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The sun is coming up. In all directions is a huge area of black hardened lava flow. It is cloudy.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain is trying its best to erode the old lavaflow underfoot, as the sun rises in the east.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_DAY:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The hot sun and complete lack of any vegetation makes for a miserable trek across jumbled lava flows.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The cloudy sky above looks down on a vast area of black, jagged lavarock.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'Rain pummels you as you slip on loose black rocks. You hope you will not be stuck here for long.'
                                ];
                                break;
                        }
                        break;
                    case c.SKY_SUNSET:
                        switch (weather) {
                            case c.WEATHER_CLEAR:
                                options = [
                                    'The sun sets over the ancient lavaflow. It was a clear, hot day. You wish there were someplace non-rocky to make camp. There is not.'
                                ];
                                break;
                            case c.WEATHER_CLOUDY:
                                options = [
                                    'The cloudy day is ending, as the sun slips down in the west. The endless jumbled rocks of the lava flow mock your efforts at finding a decent campsite.'
                                ];
                                break;
                            case c.WEATHER_STORMY:
                                options = [
                                    'This rainstorm will need to last another couple of thousand years, if it is going to have a chance at eroding this cursed lavaflow. The sun sets.'
                                ];
                                break;
                        }
                        break;
                }
                break;
            case c.TERRAIN_TYPE_IMPASSABLE_CLIFFS:
                options = [
                    'This place really is an area of impassable cliffs.'
                ];
                break;
            case c.TERRAIN_TYPE_LAVA:
                options = [
                    'The churning lava is all you can possibly notice about this place.'
                ];
                break;
        }
        if (options.length === 0) {
            throw "Could not find a description of a place. terrainType=" + terrainType + " weather=" + weather + " sky=" + sky;
        }
        return options[c.determineRandomNumberInRange(0, options.length - 1, "choose terrain description")];
    };

    World.populatePlantsAndAnimalsForNewLocation = function (terrainType) {
        var probabilityOfPlantFoodExistingInArea;
        var probabilityOfAnimalFoodExistingInArea;
        switch (terrainType) {
            case c.TERRAIN_TYPE_UNKNOWN:
                probabilityOfPlantFoodExistingInArea = 0;
                probabilityOfAnimalFoodExistingInArea = 0;
                break;
            case c.TERRAIN_TYPE_SHORE:
                probabilityOfPlantFoodExistingInArea = 0.5;
                probabilityOfAnimalFoodExistingInArea = 0.3;
                break;
            case c.TERRAIN_TYPE_OCEAN:
                probabilityOfPlantFoodExistingInArea = 0.38;
                probabilityOfAnimalFoodExistingInArea = 0.18;
                break;
            case c.TERRAIN_TYPE_MTN_OVER_PLAINS:
                probabilityOfPlantFoodExistingInArea = 0.4;
                probabilityOfAnimalFoodExistingInArea = 0.32;
                break;
            case c.TERRAIN_TYPE_MTN_OVER_PINE:
                probabilityOfPlantFoodExistingInArea = 0.51;
                probabilityOfAnimalFoodExistingInArea = 0.41;
                break;
            case c.TERRAIN_TYPE_MTN_OVER_JUNGLE:
                probabilityOfPlantFoodExistingInArea = 0.56;
                probabilityOfAnimalFoodExistingInArea = 0.48;
                break;
            case c.TERRAIN_TYPE_MTN_OVER_DESERT:
                probabilityOfPlantFoodExistingInArea = 0.03;
                probabilityOfAnimalFoodExistingInArea = 0.02;
                break;
            case c.TERRAIN_TYPE_PLAIN:
                probabilityOfPlantFoodExistingInArea = 0.59;
                probabilityOfAnimalFoodExistingInArea = 0.41;
                break;
            case c.TERRAIN_TYPE_PINE_FOREST:
                probabilityOfPlantFoodExistingInArea = 0.53;
                probabilityOfAnimalFoodExistingInArea = 0.46;
                break;
            case c.TERRAIN_TYPE_LAKE:
                probabilityOfPlantFoodExistingInArea = 0.4;
                probabilityOfAnimalFoodExistingInArea = 0.5;
                break;
            case c.TERRAIN_TYPE_RIVER:
                probabilityOfPlantFoodExistingInArea = 0.37;
                probabilityOfAnimalFoodExistingInArea = 0.66;
                break;
            case c.TERRAIN_TYPE_JUNGLE:
                probabilityOfPlantFoodExistingInArea = 0.8;
                probabilityOfAnimalFoodExistingInArea = 0.76;
                break;
            case c.TERRAIN_TYPE_DESERT:
                probabilityOfPlantFoodExistingInArea = 0.3;
                probabilityOfAnimalFoodExistingInArea = 0.2;
                break;
            case c.TERRAIN_TYPE_TOWN:
                probabilityOfPlantFoodExistingInArea = 0.05;
                probabilityOfAnimalFoodExistingInArea = 0.05;
                break;
            case c.TERRAIN_TYPE_AGRICULTURAL:
                probabilityOfPlantFoodExistingInArea = 0.8;
                probabilityOfAnimalFoodExistingInArea = 0.9;
                break;
            case c.TERRAIN_TYPE_IMPASSABLE_CLIFFS:
                probabilityOfPlantFoodExistingInArea = 0;
                probabilityOfAnimalFoodExistingInArea = 0;
                break;
            case c.TERRAIN_TYPE_CLIFFS:
                probabilityOfPlantFoodExistingInArea = 0;
                probabilityOfAnimalFoodExistingInArea = 0;
                break;
            case c.TERRAIN_TYPE_SWAMP:
                probabilityOfPlantFoodExistingInArea = 0.45;
                probabilityOfAnimalFoodExistingInArea = 0.7;
                break;
            case c.TERRAIN_TYPE_LAVAFLOW:
                probabilityOfPlantFoodExistingInArea = 0;
                probabilityOfAnimalFoodExistingInArea = 0;
                break;
            case c.TERRAIN_TYPE_LAVA:
                probabilityOfPlantFoodExistingInArea = 0;
                probabilityOfAnimalFoodExistingInArea = 0;
                break;
            default:
                throw("Unknown terrain type when arriving in new area: " + terrainType);
        }
        if (c.checkRandom(probabilityOfPlantFoodExistingInArea, "is food (animals) in area")) {
            gx.gs.foodAnimalPresenceAreaStatus = c.FOOD_PRESENCE_IN_AREA_SOME;
        } else {
            gx.gs.foodAnimalPresenceAreaStatus = c.FOOD_PRESENCE_IN_AREA_NONE;
        }
        if (c.checkRandom(probabilityOfAnimalFoodExistingInArea, "is food (plants) in area")) {
            gx.gs.foodPlantPresenceAreaStatus = c.FOOD_PRESENCE_IN_AREA_SOME;
        } else {
            gx.gs.foodPlantPresenceAreaStatus = c.FOOD_PRESENCE_IN_AREA_NONE;
        }

        gx.gs.foodPlantPresenceInAreaKnown = false;
        gx.gs.foodAnimalPresenceInAreaKnown = false;
    };

    World.getPlaceRandomOptions = function (terrainType) {
        switch (terrainType) {
            case c.TERRAIN_TYPE_UNKNOWN:
                return [
                    [100, c.PLACE_TYPE_NOTHING_OF_INTEREST]
                ];
            case c.TERRAIN_TYPE_LAKE:
            case c.TERRAIN_TYPE_LAVA:
                return [
                    [100, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_CLIFFS:
            case c.TERRAIN_TYPE_IMPASSABLE_CLIFFS:
                return [
                    [150, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [2, c.PLACE_TYPE_ENCOUNTER],
                    [2, c.PLACE_TYPE_FORTRESS],
                    [2, c.PLACE_TYPE_STONE_RUINS],
                    [5, c.PLACE_TYPE_PIT],
                    [5, c.PLACE_TYPE_CAVE],
                    [5, c.PLACE_TYPE_MINE],
                    [2, c.PLACE_TYPE_TRAP],
                    [.05, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_OCEAN:
                return [
                    [100, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [2, c.PLACE_TYPE_SHIP],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_SHORE:
                return [
                    [200, c.PLACE_TYPE_NOTHING_OF_INTEREST],
//                    [20000, c.PLACE_TYPE_MINE], // todo: enable mines (once that code is written)
                    [2, c.PLACE_TYPE_ENCOUNTER],
                    [.05, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [4, c.PLACE_TYPE_MERCHANT],
                    [.2, c.PLACE_TYPE_TRAP],
                    [2, c.PLACE_TYPE_COTTAGE],
                    [1, c.PLACE_TYPE_VILLAGE],
                    [1, c.PLACE_TYPE_FORTRESS],
                    [.1, c.PLACE_TYPE_CASTLE],
                    [2, c.PLACE_TYPE_TOWER],
                    [.2, c.PLACE_TYPE_PYRAMID],
                    [3, c.PLACE_TYPE_STONE_RUINS],
                    [1, c.PLACE_TYPE_WOODEN_RUINS],
                    [1, c.PLACE_TYPE_PIT],
                    [13, c.PLACE_TYPE_CAVE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_MTN_OVER_PLAINS:
            case c.TERRAIN_TYPE_MTN_OVER_PINE:
            case c.TERRAIN_TYPE_MTN_OVER_JUNGLE:
            case c.TERRAIN_TYPE_MTN_OVER_DESERT:
                return [
                    [200, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [3, c.PLACE_TYPE_ENCOUNTER],
                    [.1, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [.5, c.PLACE_TYPE_MERCHANT],
                    [.1, c.PLACE_TYPE_TRAP],
                    [.01, c.PLACE_TYPE_COTTAGE],
                    [1, c.PLACE_TYPE_FORTRESS],
                    [.01, c.PLACE_TYPE_CASTLE],
                    [2, c.PLACE_TYPE_TOWER],
                    [2, c.PLACE_TYPE_STONE_RUINS],
                    [.1, c.PLACE_TYPE_WOODEN_RUINS],
                    [1, c.PLACE_TYPE_PIT],
                    [7, c.PLACE_TYPE_CAVE],
                    [5, c.PLACE_TYPE_MINE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_PLAIN:
                return [
                    [200, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [3, c.PLACE_TYPE_ENCOUNTER],
                    [.04, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [3, c.PLACE_TYPE_MERCHANT],
                    [.4, c.PLACE_TYPE_TRAP],
                    [1.4, c.PLACE_TYPE_COTTAGE],
                    [2, c.PLACE_TYPE_FARM],
                    [1.7, c.PLACE_TYPE_VILLAGE],
                    [1.1, c.PLACE_TYPE_FORTRESS],
                    [.2, c.PLACE_TYPE_CASTLE],
                    [2, c.PLACE_TYPE_TOWER],
                    [3, c.PLACE_TYPE_STONE_RUINS],
                    [.7, c.PLACE_TYPE_WOODEN_RUINS],
                    [1, c.PLACE_TYPE_QUICKSAND],
                    [.5, c.PLACE_TYPE_PIT],
                    [.1, c.PLACE_TYPE_CAVE],
                    [.07, c.PLACE_TYPE_MINE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_JUNGLE:
            case c.TERRAIN_TYPE_PINE_FOREST:
                return [
                    [220, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [3, c.PLACE_TYPE_ENCOUNTER],
                    [.5, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [1.1, c.PLACE_TYPE_MERCHANT],
                    [2, c.PLACE_TYPE_TRAP],
                    [1, c.PLACE_TYPE_TREEHOUSE],
                    [3.1, c.PLACE_TYPE_COTTAGE],
                    [.1, c.PLACE_TYPE_FARM],
                    [1, c.PLACE_TYPE_VILLAGE],
                    [1, c.PLACE_TYPE_FORTRESS],
                    [.1, c.PLACE_TYPE_CASTLE],
                    [2, c.PLACE_TYPE_TOWER],
                    [2.2, c.PLACE_TYPE_PYRAMID],
                    [1.5, c.PLACE_TYPE_FAIRY_RING],
                    [1, c.PLACE_TYPE_STONE_RUINS],
                    [1, c.PLACE_TYPE_WOODEN_RUINS],
                    [3, c.PLACE_TYPE_QUICKSAND],
                    [1, c.PLACE_TYPE_PIT],
                    [2, c.PLACE_TYPE_CAVE],
                    [.8, c.PLACE_TYPE_MINE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_RIVER:
                return [
                    [150, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [1, c.PLACE_TYPE_ENCOUNTER],
                    [.1, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [4, c.PLACE_TYPE_MERCHANT],
                    [1, c.PLACE_TYPE_TRAP],
                    [1, c.PLACE_TYPE_COTTAGE],
                    [1.1, c.PLACE_TYPE_VILLAGE],
                    [.1, c.PLACE_TYPE_FORTRESS],
                    [.1, c.PLACE_TYPE_CASTLE],
                    [1, c.PLACE_TYPE_TOWER],
                    [1, c.PLACE_TYPE_STONE_RUINS],
                    [1, c.PLACE_TYPE_QUICKSAND],
                    [1, c.PLACE_TYPE_CAVE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_DESERT:
                return [
                    [200, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [1, c.PLACE_TYPE_ENCOUNTER],
                    [.01, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [1, c.PLACE_TYPE_MERCHANT],
                    [.1, c.PLACE_TYPE_TRAP],
                    [.1, c.PLACE_TYPE_COTTAGE],
                    [.1, c.PLACE_TYPE_VILLAGE],
                    [.1, c.PLACE_TYPE_FORTRESS],
                    [.01, c.PLACE_TYPE_CASTLE],
                    [2, c.PLACE_TYPE_TOWER],
                    [2, c.PLACE_TYPE_PYRAMID],
                    [1, c.PLACE_TYPE_STONE_RUINS],
                    [.5, c.PLACE_TYPE_PIT],
                    [1, c.PLACE_TYPE_CAVE],
                    [1, c.PLACE_TYPE_MINE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_TOWN:
                return [
                    [100, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [10, c.PLACE_TYPE_MERCHANT],
                    [1, c.PLACE_TYPE_CASTLE],
                    [1, c.PLACE_TYPE_TOWER],
                    [1, c.PLACE_TYPE_PYRAMID],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_AGRICULTURAL:
                return [
                    [100, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [1, c.PLACE_TYPE_ENCOUNTER],
                    [1, c.PLACE_TYPE_MERCHANT],
                    [50, c.PLACE_TYPE_FARM],
                    [5, c.PLACE_TYPE_VILLAGE],
                    [1, c.PLACE_TYPE_CASTLE],
                    [.1, c.PLACE_TYPE_FORTRESS],
                    [.1, c.PLACE_TYPE_TOWER],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_LAVAFLOW:
                return [
                    [100, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [.5, c.PLACE_TYPE_ENCOUNTER],
                    [.01, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [3, c.PLACE_TYPE_CAVE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            case c.TERRAIN_TYPE_SWAMP:
                return [
                    [200, c.PLACE_TYPE_NOTHING_OF_INTEREST],
                    [2, c.PLACE_TYPE_ENCOUNTER],
                    [.1, c.PLACE_TYPE_DAMSEL_IN_DISTRESS],
                    [.5, c.PLACE_TYPE_MERCHANT],
                    [.5, c.PLACE_TYPE_TRAP],
                    [.9, c.PLACE_TYPE_TREEHOUSE],
                    [1, c.PLACE_TYPE_COTTAGE],
                    [.5, c.PLACE_TYPE_VILLAGE],
                    [1, c.PLACE_TYPE_TOWER],
                    [1, c.PLACE_TYPE_STONE_RUINS],
                    [1, c.PLACE_TYPE_WOODEN_RUINS],
                    [5, c.PLACE_TYPE_QUICKSAND],
                    [.4, c.PLACE_TYPE_PIT],
                    [1, c.PLACE_TYPE_CAVE],
                    [.1, c.PLACE_TYPE_SKYSHIP]
                ];
            default:
                throw("Unknown terrain type: " + terrainType);
        }
    };

    return World;
});
