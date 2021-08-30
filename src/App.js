import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Input, Tree, Layout, Row, Col } from "antd";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import currency from "currency.js";
import "./App.css";
const ru = require("convert-layout/ru");

const { Search } = Input;
const { hostname } = window.location;

let dev = false;

if (hostname == "localhost") {
  dev = true;
}

function App() {
  console.log(dev);

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expanedKeys, setExpandedKeys] = useState([]);

  const loadItems = async () => {
    if (dev) {
      const { data } = await axios.get(
        "https://crm.hq.fungeek.net/rest/1/63dif6icpi61ci3f/get.product.categories"
      );
      console.log(data);
      if (data.result) {
        setCategories(data.result);
      }

      const { data: productsData } = await axios.get(
        "https://crm.hq.fungeek.net/rest/1/63dif6icpi61ci3f/get.product.list"
      );
      console.log(productsData);
      if (productsData.result) {
        setProducts(productsData.result);
      }
    } else {
      const locPath = window.location.pathname.match(/\/.*\/(\d+)\//);
      const { data } = await axios.get(
        `/ajax/get_transactions.php?orderId=${locPath[1]}`
      );
      console.log(data);

      if (data.data) {
        setItems(data.data);
      }
    }
  };

  const onTreeExpand = (expandedKeys) => {
    console.log(expandedKeys);
    setExpandedKeys(expandedKeys);
  };

  const onTreeSelect = (selectedKeys) => {
    setSelectedKeys(selectedKeys);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (item) =>
        item.NAME.toLowerCase().indexOf(searchVal) >= 0 ||
        item.NAME.toLowerCase().indexOf(ru.fromEn(searchVal)) >= 0 ||
        (selectedKeys.length &&
          selectedKeys.indexOf(+item.IBLOCK_SECTION_ID) >= 0)
    );
  }, [products, searchVal, selectedKeys]);
  console.log(filteredProducts);
  const RowItem = ({ index, style }) => (
    <div style={style}>
      <div className="px-3 py-5 rounded-md bg-white shadow-md flex justify-between">
        <div>{filteredProducts[index].NAME}</div>
        <div>
          {currency(filteredProducts[index].PRICE, {
            pattern: "# !",
            separator: " ",
            decimal: ".",
            symbol: "сўм",
            precision: 0,
          }).format()}
        </div>
      </div>
    </div>
  );

  const onSearch = (value) => setSearchVal(value);

  const onChange = (e) => {
    setSearchVal(e.target.value);
  };

  useEffect(() => {
    loadItems();
    return;
  }, []);

  return (
    <div className="p-3 bg-gray-100">
      <Layout className="bg-gray-100">
        <Search
          placeholder="Поиск товара"
          onSearch={onSearch}
          onChange={onChange}
          enterButton
          allowClear
        />
        <Row gutter={16} className="pt-4">
          <Col span={6}>
            <Tree
              treeData={categories}
              key="ID"
              // selectable={true}
              showLine={true}
              className="p-3"
              titleRender={(item) => <div>{item.NAME}</div>}
              selectedKeys={selectedKeys}
              // expandedKeys={expanedKeys}
              // onExpand={onTreeExpand}
              onSelect={onTreeSelect}
            />
          </Col>
          <Col span={18}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={filteredProducts.length}
                  itemSize={70}
                  width={width}
                >
                  {RowItem}
                </List>
              )}
            </AutoSizer>
          </Col>
        </Row>
      </Layout>
    </div>
  );
}

export default App;
