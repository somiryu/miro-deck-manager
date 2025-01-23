## Deck Manager

This is a Miro extension to use shapes, sticky notes and images as playing cards or dice.
Developed by Azahar Games, a board game publisher in Colombia. We use this extension to design and test board games in Miro.

## Installation

Use the following link to install the App:
https://miro.com/app-install/?response_type=code&client_id=3458764611484031096&redirect_uri=%2Fapp-install%2Fconfirm%2F

The app is currently a Beta.

## Understand the "Card"

A card for this app is a grouping of elements that can have a cover. The cover element should be single shape or image, and should be composed of multiple elements. Imagine the cover as the back side of your card. 

The front of the card can be a single image or shape (preferable), or can be a group of elements as well. 

After creating the front of a card, create the cover on top and then group every thing. When you flip and unflip a card you will be sending the cover to the front or the back of the group to simulate a two sided card. 

## Understand the "Dice"

A die is a group of shapes or images. You can group them or just select all of them. Create all the faces of your die and then "stack" them together. When you roll, one of the faces will be randomly brought on top. DO NOT create die faces composed of multiple grouped elements: each face must be one shape or image only!

## The element

If this docs says you can select and element, it means a single shape or image that is not within a group. Selecting multiple elements means selecting multiple non-group single elements.

## Important on Miro groupings
Miro will not create groups of groups, so if you create a card made of groups of objects and then try to group all cards as a deck, you will get only one group with all the elements that were part of the cards, which will break many of the functionalities of this app.

To avoid this, do not group deck of grouped cards or elements. Each card must be a SINGLE group.


### Functionality

- Shuffle: select multiple elements or cards at once and shuffle them. If you are unsure if the shuffle fucntionality is working, spread your cards first, shuffle them, them stack them. 
- Flip: Use in cards to take the top element of a group (probably the cover) and send it to the back of the stack.
- UnFlip: Use in cards to take the bottom element of a group (probably the cover) and send it to the front of the stack. If your cards have only two elements, you can use Flip instead.
- Stack: Select multiple elements and click this buttom so all are centered on a single point, building a deck. This function is incompatible with Layers.
- Random Pick: Select multiple elements or cards and then pick one at random and send it to front. The selection will be auto-selected.
- Spread: select a min and max range and click the button to spread all elements or cards randomly in the space. This function is incompatible with Layers.
- Roll: Create a dice (see above) and click this button to emulate the rolling of a dice: one element will get to be on top at random.
- +/-#: If you select a shape or text element with a numeric content, this buttons will increase or decrease their value by #.
- Sync: See Data Management below


## Groups
To build a "card" we recomend grouping only two elements, one for the cover of the card and one for the front face. If you need an element with multiple shapes grouped together, we recommend copying the elements as an image and then using the image version to create the card. While some functionalities might work with grouped elements, we recommend making a copy of your work before testing the extension.

Miro API doesn't allow to move or reorder "group" elements, making this a workaround to make it work.

# Data Management
The app has a sync button that allows you to use the elements of a Miro Card (not a card as understood in this guide, but the actual widget call card by Miro) and use it's contents to populate the contents of other elements. To make it work:

1. Create a Miro Card. Give it a descriptive title.
2. Open the Card. In the description field you will use key::value pairs like this:

"ti1::My awesome game card title
ct1::The content for a card"

Each line is a key::value pair, so each time you use enter, you are entering a new field.
The key will always be anything you like plus (::), so it can be yes2::. The information before (::) will be used to find components to update, so make sure its a couple of characters and numbers. Something like id1 or cc3 works fine.

3. Create sticky notes, text elements or shapes and in their content write the key you want to be updated. For example, you create a title for a game card with a rectabgle shape and place "ti1" as the content.
4. Whenever you click the sync button, every Miro element that has a "content" property that has the key string will be changed in a way the key remains, but the value content is added like this:

"(ti1)My awesome game card title"

IMPORTANT: If you remove the key, for example buy deleting the "(ti1)" string, you won't be able to sync this component again.

## MIRO credits
Each transaction spends credits and there is a limit to the amount of credits you can use in a minute. If you make expensive operations (like shuffling hundreds of cards) to often, the app might stop working for a minute. Be careful.

### Azahar

Visit us at www.azaharjuegos.com