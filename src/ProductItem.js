import React, { useState, useMemo, memo } from "react";
import { Disclosure, Transition, Switch } from "@headlessui/react";
import currency from "currency.js";

import { ChevronUpIcon } from "@heroicons/react/solid";
import axios from "axios";
require("dotenv").config();

const ProductItem = ({ style, product, loadCart }) => {
  const defaultModifiers = [];

  if (product.modifiers) {
    const freeModifier = product.modifiers.find((mod) => mod.PRICE == 0);
    defaultModifiers.push(freeModifier.PRODUCT_ID);
  }

  const [chosenModifiers, setChosenModifiers] = useState(defaultModifiers);

  const [isAddingCart, setIsAddingCart] = useState(false);

  const switchModifier = (modId) => {
    let mods = [...chosenModifiers];
    if (chosenModifiers.indexOf(modId) >= 0) {
      mods = [...chosenModifiers.filter((mod) => mod != modId)];
    } else {
      mods.push(modId);
    }

    if (mods.length == 0) {
      const freeModifier = product.modifiers.find((mod) => mod.PRICE == 0);
      mods.push(freeModifier.PRODUCT_ID);
    }
    setChosenModifiers(mods);
  };

  const addToCart = async () => {
    setIsAddingCart(true);
    const rowData = {
      productId: product.PRODUCT_ID,
    };
    if (chosenModifiers.length > 0) {
      rowData.modifiers = chosenModifiers;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get("dealId");
    if (dealId) {
      rowData.dealId = dealId;
    }
    const { data } = await axios.post(
      `https://${process.env.REACT_APP_CRM_URL}/rest/1/63dif6icpi61ci3f/add.deal.basket.item`,
      rowData
    );

    setIsAddingCart(false);

    loadCart();
  };

  const totalPrice = useMemo(() => {
    let price = +product.PRICE;
    if (chosenModifiers.length > 0) {
      const modifiersPrice = product.modifiers
        .filter((mod) => chosenModifiers.indexOf(mod.PRODUCT_ID) >= 0)
        .map((mod) => +mod.PRICE)
        .reduce((a, b) => a + b);
      price += modifiersPrice;
    }
    return price;
  }, [product, chosenModifiers]);

  return (
    <div style={style}>
      <div className="relative">
        {product.modifiers ? (
          <Disclosure>
            {({ open }) => (
              <>
                <div className="px-3 py-3 rounded-md border bg-white flex justify-between items-center">
                  <div className="flex-grow">{product.NAME}</div>
                  <div className="mx-8">
                    {currency(product.PRICE, {
                      pattern: "# !",
                      separator: " ",
                      decimal: ".",
                      symbol: "сўм",
                      precision: 0,
                    }).format()}
                  </div>
                  <div className="w-60 text-right">
                    <Disclosure.Button className="bg-blue-400 px-3 py-2 flex rounded-md items-center uppercase text-white">
                      <span>Выбрать модификаторы</span>
                      <ChevronUpIcon
                        className={`${
                          open ? "" : "transform rotate-180"
                        } w-5 h-5 text-purple-500`}
                      />{" "}
                    </Disclosure.Button>
                  </div>
                </div>
                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  {/*
              Don't forget to add `static` to your Disclosure.Panel!
            */}
                  <Disclosure.Panel
                    static
                    className="absolute bg-white border-2 border-blue-200 mt-1 p-4 rounded-b-lg shadow-lg w-full z-20"
                  >
                    <div>
                      <div className="divide-black divide-opacity-25 divide-y">
                        {product.modifiers.map((mod) => (
                          <div
                            key={mod.ID}
                            className="flex justify-between py-2"
                          >
                            <Switch
                              checked={
                                chosenModifiers.indexOf(mod.PRODUCT_ID) >= 0
                              }
                              onChange={() => switchModifier(mod.PRODUCT_ID)}
                              className={`${
                                chosenModifiers.indexOf(mod.PRODUCT_ID) >= 0
                                  ? "bg-blue-500"
                                  : "bg-blue-300"
                              } relative inline-flex items-center h-6 rounded-full w-11`}
                            >
                              <span className="sr-only">Use setting</span>
                              <span
                                aria-hidden="true"
                                className={`${
                                  chosenModifiers.indexOf(mod.PRODUCT_ID) >= 0
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                } inline-block w-4 h-4 transform bg-white rounded-full`}
                              />
                            </Switch>
                            <div className="flex-grow mx-4">{mod.NAME}</div>
                            <div>
                              {currency(mod.PRICE, {
                                pattern: "# !",
                                separator: " ",
                                decimal: ".",
                                symbol: "сўм",
                                precision: 0,
                              }).format()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end text-xl mt-2">
                        <span className="font-bold">Итоговая сумма: </span>
                        {currency(totalPrice, {
                          pattern: "# !",
                          separator: " ",
                          decimal: ".",
                          symbol: "сўм",
                          precision: 0,
                        }).format()}
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          className="bg-blue-400 px-4 py-3 text-white uppercase rounded-md w-48 text-center"
                          onClick={addToCart}
                          disabled={isAddingCart}
                        >
                          {isAddingCart ? (
                            <span>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  stroke-width="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </span>
                          ) : (
                            <span>Добавить в корзину</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        ) : (
          <div className="px-3 py-3 rounded-md bg-white border flex justify-between items-center">
            <div className="flex-grow">{product.NAME}</div>
            <div className="mx-8">
              {currency(product.PRICE, {
                pattern: "# !",
                separator: " ",
                decimal: ".",
                symbol: "сўм",
                precision: 0,
              }).format()}
            </div>

            <div className="w-60 text-right">
              <button
                className="bg-blue-400 px-3 py-2 rounded-md uppercase text-white w-48 text-center"
                onClick={addToCart}
                disabled={isAddingCart}
              >
                {isAddingCart ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Добавить в корзину"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ProductItem);
