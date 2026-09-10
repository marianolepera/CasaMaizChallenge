import {CardGrid} from './cardGrid';
import {Carousel} from './carousel';
import {PromoRail} from './promoRail';
import {RestaurantCTA} from './restaurantCTA';
import {RestaurantHero} from './restaurantHero';
import {TextBlock} from './textBlock';
import {UnknownBlock} from './UnknownBlock';
import type {BlockComponent} from './types';

export const blockRegistry: Record<string, BlockComponent> = {
  restaurantHero: RestaurantHero,
  cardGrid: CardGrid,
  carousel: Carousel,
  promoRail: PromoRail,
  textBlock: TextBlock,
  restaurantCTA: RestaurantCTA,
};

export function getBlockComponent(blockType: string): BlockComponent {
  return blockRegistry[blockType] ?? UnknownBlock;
}
