import browser from "webextension-polyfill";

console.log("Hello from the background!");

// 将规则添加逻辑封装到一个函数中
function addRules() {
  browser.declarativeNetRequest.getDynamicRules()
    .then(existingRules => {
      const maxId = Math.max(0, ...existingRules.map(rule => rule.id));
      let newRuleId = maxId + 1;
      
      const newRules: browser.DeclarativeNetRequest.Rule[] = [
        {
          id: newRuleId++,
          priority: 1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              {
                header: "origin",
                operation: "remove"
              }
            ]
          },
          condition: {
            urlFilter: "||127.0.0.1",
            initiatorDomains: [browser.runtime.id],
            resourceTypes: ["xmlhttprequest", "other"]
          }
        },
        {
          id: newRuleId++,
          priority: 1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              {
                header: "origin",
                operation: "remove"
              }
            ]
          },
          condition: {
            urlFilter: "||localhost",
            initiatorDomains: [browser.runtime.id],
            resourceTypes: ["xmlhttprequest", "other"]
          }
        },
      ];

      return browser.declarativeNetRequest.updateDynamicRules({
        addRules: newRules
      });
    })
    .then(() => {
      console.log("规则已成功添加");
      return browser.declarativeNetRequest.getDynamicRules();
    })
    .then(rules => {
      console.log("当前动态规则：", rules);
    })
    .catch(error => {
      console.error("更新或获取规则时出错：", error);
    });
}

// 监听插件安装事件
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('插件已安装，正在添加规则...');
    addRules();
  }
});
