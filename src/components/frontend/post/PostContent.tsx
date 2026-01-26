"use client";

import { useEffect, useRef, useCallback } from "react";
import "@/styles/post-content.css";
import "@/styles/iconfont-anzhiyu.css";

// 扩展 Window 接口以支持全局函数
declare global {
  interface Window {
    __markdownEditorCopyHandler?: (codeElement: HTMLElement) => void;
    __musicPlayerToggle?: (playerId: string) => Promise<void>;
    __musicPlayerSeek?: (playerId: string, event: MouseEvent) => void;
  }
}

interface PostContentProps {
  content: string;
  className?: string;
}

/**
 * 显示复制成功的 Toast 提示
 * 从顶部弹出，简洁流畅的动画
 */
const showCopyToast = (message: string = "复制成功", type: "success" | "error" = "success") => {
  // 移除已存在的 toast
  const existingToast = document.getElementById("copy-toast");
  if (existingToast) {
    existingToast.remove();
  }

  // 创建 toast 容器
  const toast = document.createElement("div");
  toast.id = "copy-toast";

  // 成功/错误图标 SVG
  const iconSvg =
    type === "success"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M20 6L9 17l-5-5"/>
         </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
         </svg>`;

  toast.innerHTML = `<span class="toast-icon">${iconSvg}</span><span>${message}</span>`;

  // 注入样式（如果还没有）
  if (!document.getElementById("copy-toast-styles")) {
    const style = document.createElement("style");
    style.id = "copy-toast-styles";
    style.textContent = `
      #copy-toast {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        background: #059669;
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
      }
      #copy-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;
      }
      #copy-toast.hide {
        opacity: 0;
        transform: translateX(-50%) translateY(-8px);
        transition: opacity 0.15s ease-in, transform 0.15s ease-in;
      }
      #copy-toast.error { background: #dc2626; }
      #copy-toast .toast-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        animation: none !important;
        transition: none !important;
      }
      #copy-toast .toast-icon svg {
        width: 100%;
        height: 100%;
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (type === "error") {
    toast.classList.add("error");
  }
  document.body.appendChild(toast);

  // 触发重排后添加 show 类，确保动画生效
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // 1.5秒后隐藏
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 150);
  }, 1500);
};

/**
 * PostContent 组件
 * 处理文章内容的渲染和交互，与 anheyu-pro 兼容
 */
export function PostContent({ content, className = "" }: PostContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 初始化代码块展开/收起功能
   * anheyu-pro 的代码块使用 details/summary 元素实现原生折叠
   * 同时支持底部 code-expand-btn 按钮控制超长代码的展开/折叠
   */
  const initCodeBlockExpand = useCallback((container: HTMLElement) => {
    const codeBlocks = container.querySelectorAll<HTMLElement>("details.md-editor-code");
    const maxHeight = 280; // 与 anheyu-pro 保持一致

    codeBlocks.forEach(block => {
      const pre = block.querySelector("pre") as HTMLElement;
      if (!pre) return;

      // 检查当前 pre 高度，判断是否需要折叠
      // 注意：需要先打开 details 才能测量真实高度
      const wasOpen = block.hasAttribute("open");
      if (!wasOpen) {
        block.setAttribute("open", "");
      }

      const codeHeight = pre.scrollHeight;
      const needsCollapse = codeHeight > maxHeight;

      // 恢复原来的状态
      if (!wasOpen) {
        block.removeAttribute("open");
      }

      if (needsCollapse) {
        // 如果 HTML 没有设置折叠状态，则设置
        if (!block.classList.contains("is-collapsible")) {
          block.classList.add("is-collapsible", "is-collapsed");
          pre.style.height = `${maxHeight}px`;
          pre.style.overflow = "hidden";
        }

        // 检查或创建展开按钮
        let expandBtn = block.querySelector<HTMLElement>(".code-expand-btn");
        if (!expandBtn) {
          expandBtn = document.createElement("div");
          expandBtn.className = "code-expand-btn";
          expandBtn.innerHTML =
            '<i class="anzhiyufont anzhiyu-icon-angle-double-down" style="transition: transform 0.3s ease;"></i>';
          block.appendChild(expandBtn);
        }

        // 为按钮添加点击事件（移除可能存在的内联 onclick 以避免冲突）
        expandBtn.removeAttribute("onclick");
        expandBtn.addEventListener("click", e => {
          e.stopPropagation();
          e.preventDefault();
          const icon = expandBtn!.querySelector("i");
          if (block.classList.contains("is-collapsed")) {
            block.classList.remove("is-collapsed");
            block.setAttribute("open", "");
            expandBtn!.classList.add("is-expanded");
            pre.style.height = "";
            pre.style.overflow = "";
            if (icon) icon.style.transform = "rotate(180deg)";
          } else {
            block.classList.add("is-collapsed");
            expandBtn!.classList.remove("is-expanded");
            pre.style.height = `${maxHeight}px`;
            pre.style.overflow = "hidden";
            if (icon) icon.style.transform = "rotate(0deg)";
          }
        });
      }
    });
  }, []);

  /**
   * 初始化代码块头部点击展开功能
   * details/summary 元素的 summary 点击会触发浏览器原生的切换行为
   * anheyu-pro 生成的 .expand 图标有内联 onclick，但在 React dangerouslySetInnerHTML 中可能不执行
   * 所以需要手动为 .expand 图标添加事件监听
   */
  const initCodeHeadClick = useCallback((container: HTMLElement) => {
    const codeBlocks = container.querySelectorAll<HTMLElement>("details.md-editor-code");

    codeBlocks.forEach(block => {
      const summary = block.querySelector<HTMLElement>("summary.md-editor-code-head");
      if (!summary) return;

      // 为 .expand 图标添加点击事件（移除内联 onclick）
      const expandIcon = summary.querySelector<HTMLElement>(".expand");
      if (expandIcon) {
        expandIcon.removeAttribute("onclick");
        expandIcon.style.cursor = "pointer";
        expandIcon.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          // 切换 open 状态
          if (block.hasAttribute("open")) {
            block.removeAttribute("open");
          } else {
            block.setAttribute("open", "");
          }
        });
      }

      // 阻止 summary 的默认行为，手动控制 open 状态
      summary.addEventListener("click", e => {
        // 如果点击的是复制按钮或展开图标，不处理（已有单独的处理）
        const target = e.target as HTMLElement;
        if (target.closest(".copy-button") || target.closest(".expand")) return;

        e.preventDefault();
        // 切换 open 状态
        if (block.hasAttribute("open")) {
          block.removeAttribute("open");
        } else {
          block.setAttribute("open", "");
        }
      });
    });
  }, []);

  /**
   * 初始化代码复制功能
   * 注意：anheyu-pro 生成的 HTML 中的复制按钮已有内联 onclick，调用 window.__markdownEditorCopyHandler
   * 此函数仅为没有内联 onclick 的按钮添加事件监听作为备用
   */
  const initCodeCopy = useCallback((container: HTMLElement) => {
    const copyButtons = container.querySelectorAll<HTMLElement>(".copy-button");

    copyButtons.forEach(btn => {
      // 检查是否已有内联 onclick（由 md-editor-v3 生成）
      const hasInlineOnclick = btn.hasAttribute("onclick");

      if (!hasInlineOnclick) {
        // 只为没有内联 onclick 的按钮添加事件监听
        btn.addEventListener("click", async e => {
          e.stopPropagation();
          e.preventDefault();
          const codeBlock = btn.closest(".md-editor-code");
          const code =
            codeBlock?.querySelector(".md-editor-code-block")?.textContent ||
            codeBlock?.querySelector("pre code")?.textContent ||
            "";

          try {
            await navigator.clipboard.writeText(code);
            showCopyToast("复制成功", "success");
          } catch {
            showCopyToast("复制失败", "error");
          }
        });
      }
    });
  }, []);

  /**
   * 初始化 Tab 切换功能
   * 注意：anheyu-pro 生成的 HTML 中的 tab 按钮已有内联 onclick
   * 此函数仅为没有内联 onclick 的标签添加事件监听，并确保默认激活状态
   */
  const initTabs = useCallback((container: HTMLElement) => {
    const tabsContainers = container.querySelectorAll<HTMLElement>(".tabs");

    tabsContainers.forEach(tabsContainer => {
      const tabs = tabsContainer.querySelectorAll<HTMLElement>(".nav-tabs .tab");
      const contents = tabsContainer.querySelectorAll<HTMLElement>(".tab-item-content");

      tabs.forEach(tab => {
        // 检查是否已有内联 onclick
        const hasInlineOnclick = tab.hasAttribute("onclick");

        if (!hasInlineOnclick) {
          // 只为没有内联 onclick 的标签添加事件监听
          tab.addEventListener("click", e => {
            e.preventDefault();
            if (tab.classList.contains("active")) return;

            // 移除所有 active 状态
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            // 激活当前 tab
            tab.classList.add("active");
            const targetId = tab.getAttribute("data-href");
            if (targetId) {
              const targetContent = document.getElementById(targetId);
              if (targetContent) {
                targetContent.classList.add("active");
              }
            }
          });
        }
      });

      // 确保有默认激活的标签
      if (tabs.length > 0 && !tabsContainer.querySelector(".tab.active")) {
        tabs[0].classList.add("active");
        if (contents[0]) {
          contents[0].classList.add("active");
        }
      }
    });
  }, []);

  /**
   * 初始化 Tip 功能
   * 支持 hover 和 click 两种触发方式（参考 anheyu-pro 实现）
   */
  const initTipHover = useCallback((container: HTMLElement) => {
    const tipWrappers = container.querySelectorAll<HTMLElement>(".anzhiyu-tip-wrapper:not([data-tip-initialized])");

    tipWrappers.forEach(wrapper => {
      const tooltip = wrapper.querySelector<HTMLElement>(".anzhiyu-tip");
      if (!tooltip) return;

      const trigger = tooltip.dataset.trigger || "hover";
      const delay = parseInt(tooltip.dataset.delay || "0", 10);

      // 标记为已初始化
      wrapper.dataset.tipInitialized = "true";

      // 存储定时器
      let showTimer: ReturnType<typeof setTimeout> | null = null;
      let hideTimer: ReturnType<typeof setTimeout> | null = null;

      const showTooltip = () => {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        showTimer = setTimeout(() => {
          tooltip.style.visibility = "visible";
          tooltip.style.opacity = "1";
          tooltip.dataset.visible = "true";
        }, delay);
      };

      const hideTooltip = () => {
        if (showTimer) {
          clearTimeout(showTimer);
          showTimer = null;
        }
        hideTimer = setTimeout(() => {
          tooltip.style.visibility = "hidden";
          tooltip.style.opacity = "0";
          tooltip.dataset.visible = "false";
        }, 100);
      };

      const toggleTooltip = (e: Event) => {
        e.stopPropagation();
        const isVisible = tooltip.dataset.visible === "true";
        if (isVisible) {
          tooltip.style.visibility = "hidden";
          tooltip.style.opacity = "0";
          tooltip.dataset.visible = "false";
        } else {
          tooltip.style.visibility = "visible";
          tooltip.style.opacity = "1";
          tooltip.dataset.visible = "true";
        }
      };

      if (trigger === "click") {
        wrapper.addEventListener("click", toggleTooltip);
        // 点击其他区域关闭
        const closeOnClickOutside = (e: Event) => {
          if (!wrapper.contains(e.target as Node) && tooltip.dataset.visible === "true") {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
            tooltip.dataset.visible = "false";
          }
        };
        document.addEventListener("click", closeOnClickOutside);
      } else {
        wrapper.addEventListener("mouseenter", showTooltip);
        wrapper.addEventListener("mouseleave", hideTooltip);
      }
    });
  }, []);

  /**
   * 初始化隐藏内容展开功能
   * 注意：anheyu-pro 生成的 HTML 中的按钮已有内联 onclick
   * 内联 onclick 只支持展开（隐藏按钮、显示内容），不支持收起
   * 此函数仅为没有内联 onclick 的按钮添加事件监听
   */
  const initHideContent = useCallback((container: HTMLElement) => {
    const hideBlocks = container.querySelectorAll<HTMLElement>(".hide-block, .hide-inline");

    hideBlocks.forEach(block => {
      const button = block.querySelector<HTMLElement>(".hide-button");
      const content = block.querySelector<HTMLElement>(".hide-content");

      if (!button || !content) return;

      // 检查是否已有内联 onclick
      const hasInlineOnclick = button.hasAttribute("onclick");

      if (!hasInlineOnclick) {
        // 确保内容初始隐藏
        if (!content.style.display) {
          content.style.display = "none";
        }

        // 保存原始文本
        button.setAttribute("data-original-text", button.textContent || "展开");

        button.addEventListener("click", () => {
          const isHidden = content.style.display === "none";

          if (isHidden) {
            content.style.display = block.classList.contains("hide-inline") ? "inline" : "block";
            button.textContent = "收起";
          } else {
            content.style.display = "none";
            button.textContent = button.getAttribute("data-original-text") || "展开";
          }
        });
      }
    });
  }, []);

  /**
   * 初始化图片点击预览（简单实现）
   */
  const initImagePreview = useCallback((container: HTMLElement) => {
    const images = container.querySelectorAll<HTMLImageElement>("img:not(.gallery-item img):not(.btn-icon img)");

    images.forEach(img => {
      if (img.closest("a")) return; // 跳过已有链接包裹的图片

      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        // 创建预览层
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          cursor: pointer;
        `;

        const previewImg = document.createElement("img");
        previewImg.src = img.src;
        previewImg.style.cssText = `
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
        `;

        overlay.appendChild(previewImg);
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        const close = () => {
          document.body.removeChild(overlay);
          document.body.style.overflow = "";
        };

        overlay.addEventListener("click", close);
        document.addEventListener(
          "keydown",
          e => {
            if (e.key === "Escape") close();
          },
          { once: true }
        );
      });
    });
  }, []);

  /**
   * 初始化画廊图片点击
   */
  const initGalleryClick = useCallback((container: HTMLElement) => {
    const galleryItems = container.querySelectorAll<HTMLElement>(".gallery-item");

    galleryItems.forEach((item, index) => {
      const img = item.querySelector<HTMLImageElement>("img");
      if (!img) return;

      const allImages = container.querySelectorAll<HTMLImageElement>(".gallery-item img");
      const imageSources = Array.from(allImages).map(i => i.src);

      img.addEventListener("click", () => {
        // 创建预览层
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;

        let currentIndex = index;

        const renderImage = () => {
          const previewImg = overlay.querySelector("img");
          if (previewImg) {
            previewImg.src = imageSources[currentIndex];
          }
        };

        const previewImg = document.createElement("img");
        previewImg.src = imageSources[currentIndex];
        previewImg.style.cssText = `
          max-width: 90vw;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 8px;
        `;

        // 左右切换按钮
        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = "‹";
        prevBtn.style.cssText = `
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 48px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          opacity: ${currentIndex > 0 ? 1 : 0.3};
        `;

        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = "›";
        nextBtn.style.cssText = `
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 48px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          opacity: ${currentIndex < imageSources.length - 1 ? 1 : 0.3};
        `;

        // 关闭按钮
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "×";
        closeBtn.style.cssText = `
          position: absolute;
          right: 20px;
          top: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 32px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          cursor: pointer;
        `;

        const close = () => {
          document.body.removeChild(overlay);
          document.body.style.overflow = "";
        };

        prevBtn.addEventListener("click", e => {
          e.stopPropagation();
          if (currentIndex > 0) {
            currentIndex--;
            renderImage();
            prevBtn.style.opacity = currentIndex > 0 ? "1" : "0.3";
            nextBtn.style.opacity = currentIndex < imageSources.length - 1 ? "1" : "0.3";
          }
        });

        nextBtn.addEventListener("click", e => {
          e.stopPropagation();
          if (currentIndex < imageSources.length - 1) {
            currentIndex++;
            renderImage();
            prevBtn.style.opacity = currentIndex > 0 ? "1" : "0.3";
            nextBtn.style.opacity = currentIndex < imageSources.length - 1 ? "1" : "0.3";
          }
        });

        closeBtn.addEventListener("click", close);

        overlay.appendChild(previewImg);
        if (imageSources.length > 1) {
          overlay.appendChild(prevBtn);
          overlay.appendChild(nextBtn);
        }
        overlay.appendChild(closeBtn);

        overlay.addEventListener("click", e => {
          if (e.target === overlay) close();
        });

        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        // 键盘导航
        const handleKeydown = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            close();
            document.removeEventListener("keydown", handleKeydown);
          } else if (e.key === "ArrowLeft" && currentIndex > 0) {
            currentIndex--;
            renderImage();
            prevBtn.style.opacity = currentIndex > 0 ? "1" : "0.3";
            nextBtn.style.opacity = currentIndex < imageSources.length - 1 ? "1" : "0.3";
          } else if (e.key === "ArrowRight" && currentIndex < imageSources.length - 1) {
            currentIndex++;
            renderImage();
            prevBtn.style.opacity = currentIndex > 0 ? "1" : "0.3";
            nextBtn.style.opacity = currentIndex < imageSources.length - 1 ? "1" : "0.3";
          }
        };

        document.addEventListener("keydown", handleKeydown);
      });
    });
  }, []);

  /**
   * 初始化 Mermaid 图表缩放功能
   * 参考 anheyu-pro 的实现，添加 pin 按钮和缩放/平移功能
   */
  const initMermaidZoom = useCallback((container: HTMLElement) => {
    const mermaidContainers = container.querySelectorAll<HTMLElement>(".md-editor-mermaid");
    if (mermaidContainers.length === 0) return;

    // 存储事件清理函数
    const cleanupFunctions: (() => void)[] = [];

    // Pin 图标 SVG
    const pinOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"></path><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"></path><path d="m2 2 20 20"></path><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"></path></svg>`;
    const pinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path></svg>`;

    // 添加缩放/平移事件
    const addZoomEvent = (el: HTMLElement) => {
      let scale = 1;
      let translateX = 0;
      let translateY = 0;
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      const updateTransform = () => {
        const svg = el.querySelector<SVGSVGElement>("svg");
        if (svg) {
          svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          svg.style.transformOrigin = "center center";
        }
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        scale = Math.max(0.5, Math.min(3, scale + delta));
        updateTransform();
      };

      const onMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        el.style.cursor = "grabbing";
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
      };

      const onMouseUp = () => {
        isDragging = false;
        el.style.cursor = "grab";
      };

      const onMouseLeave = () => {
        isDragging = false;
        el.style.cursor = "grab";
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("mousemove", onMouseMove);
      el.addEventListener("mouseup", onMouseUp);
      el.addEventListener("mouseleave", onMouseLeave);

      el.style.cursor = "grab";
      el.style.overflow = "hidden";

      return () => {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseup", onMouseUp);
        el.removeEventListener("mouseleave", onMouseLeave);
        // 重置变换
        const svg = el.querySelector<SVGSVGElement>("svg");
        if (svg) {
          svg.style.transform = "";
        }
        el.style.cursor = "";
        el.removeAttribute("data-grab");
      };
    };

    mermaidContainers.forEach(mm => {
      // 标记为已处理
      mm.setAttribute("data-processed", "true");

      // 检查是否已有 action div
      let actionDiv = mm.querySelector<HTMLElement>(".md-editor-mermaid-action");

      // 如果 action div 是兄弟元素而不是子元素，移动它到 mermaid 块内部
      if (!actionDiv && mm.nextElementSibling?.classList.contains("md-editor-mermaid-action")) {
        actionDiv = mm.nextElementSibling as HTMLElement;
        mm.appendChild(actionDiv);
      }

      // 如果没有 action div，创建一个
      if (!actionDiv) {
        actionDiv = document.createElement("div");
        actionDiv.className = "md-editor-mermaid-action";
        actionDiv.innerHTML = pinOffIcon;
        mm.appendChild(actionDiv);
      } else {
        // 确保已有的 action div 有正确的图标
        if (!actionDiv.querySelector("svg")) {
          actionDiv.innerHTML = pinOffIcon;
        }
      }

      let removeZoomEvent: (() => void) | null = null;

      const onClick = () => {
        if (removeZoomEvent) {
          // 已启用缩放，点击后禁用
          removeZoomEvent();
          removeZoomEvent = null;
          mm.removeAttribute("data-grab");
          actionDiv!.innerHTML = pinOffIcon;
        } else {
          // 未启用缩放，点击后启用
          removeZoomEvent = addZoomEvent(mm);
          mm.setAttribute("data-grab", "");
          actionDiv!.innerHTML = pinIcon;
        }
      };

      actionDiv.addEventListener("click", onClick);

      cleanupFunctions.push(() => {
        actionDiv?.removeEventListener("click", onClick);
        removeZoomEvent?.();
      });
    });

    // 返回清理函数
    return () => {
      cleanupFunctions.forEach(fn => fn());
    };
  }, []);

  /**
   * 初始化复制添加版权信息
   */
  const initCopyWithCopyright = useCallback((container: HTMLElement) => {
    container.addEventListener("copy", (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection) return;

      const selectedText = selection.toString();
      if (selectedText.length > 100) {
        e.preventDefault();

        const copyright = `\n\n————————————————\n版权声明：本文为原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。\n原文链接：${window.location.href}`;

        const textWithCopyright = selectedText + copyright;

        e.clipboardData?.setData("text/plain", textWithCopyright);
      }
    });
  }, []);

  /**
   * 全局代码复制处理函数
   * 供 HTML 中的内联 onclick 事件调用（与 anheyu-pro 兼容）
   */
  const handleGlobalCodeCopy = useCallback((codeElement: HTMLElement) => {
    if (codeElement) {
      navigator.clipboard
        .writeText(codeElement.textContent || "")
        .then(() => {
          showCopyToast("复制成功", "success");
        })
        .catch(() => {
          showCopyToast("复制失败", "error");
        });
    }
  }, []);

  /**
   * 格式化时间（音乐播放器用）
   */
  const formatTime = useCallback((seconds: number) => {
    if (!isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  /**
   * 将 http:// 链接转换为 https://
   */
  const ensureHttps = useCallback((url: string) => {
    if (!url) return url;
    if (url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }
    return url;
  }, []);

  /**
   * 通过 API 获取音频资源
   */
  const fetchAudioUrl = useCallback(
    async (neteaseId: string): Promise<string | null> => {
      try {
        const response = await fetch("/api/public/music/song-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ neteaseId }),
        });
        const data = await response.json();
        if (data.code === 200 && data.data?.audioUrl) {
          return ensureHttps(data.data.audioUrl);
        }
        return null;
      } catch (error) {
        console.error("[音乐播放器] 获取音频资源失败:", error);
        return null;
      }
    },
    [ensureHttps]
  );

  /**
   * 初始化音乐播放器数据（通过 API 动态获取音频源）
   */
  const initMusicPlayerData = useCallback(
    async (playerId: string) => {
      const player = document.getElementById(playerId);
      if (!player || player.dataset.audioLoaded) return;

      const audio = player.querySelector(".music-audio-element") as HTMLAudioElement;
      const errorEl = player.querySelector(".music-error") as HTMLElement;

      if (!audio) {
        console.error("[音乐播放器] 未找到 audio 元素:", playerId);
        return;
      }

      try {
        const musicDataAttr = player.getAttribute("data-music-data");
        if (!musicDataAttr) {
          console.error("[音乐播放器] 没有找到 data-music-data 属性");
          if (errorEl) errorEl.style.display = "flex";
          return;
        }

        // 解码 HTML 实体
        const decodedData = musicDataAttr
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, "&");

        const musicData = JSON.parse(decodedData);

        // 音频链接具有时效性，需要通过 API 动态获取
        if (!musicData.neteaseId) {
          console.error("[音乐播放器] 缺少网易云音乐 ID，无法获取音频资源");
          if (errorEl) errorEl.style.display = "flex";
          return;
        }

        console.log("[音乐播放器] 通过 API 获取音频链接 - 网易云 ID:", musicData.neteaseId);
        player.classList.add("loading");

        const audioUrl = await fetchAudioUrl(musicData.neteaseId);
        if (audioUrl) {
          audio.src = audioUrl;
          audio.preload = "metadata";

          // 监听 loadedmetadata 事件以更新播放时长
          const durationEl = player.querySelector(".duration") as HTMLElement;
          const updateDuration = () => {
            if (durationEl && audio.duration) {
              durationEl.textContent = formatTime(audio.duration);
            }
          };

          if (audio.readyState >= 1) {
            updateDuration();
          } else {
            audio.addEventListener("loadedmetadata", updateDuration, { once: true });
          }

          audio.load();
          player.dataset.audioLoaded = "true";
          player.classList.remove("loading");
          console.log("[音乐播放器] 加载完成:", musicData.name);
        } else {
          console.error("[音乐播放器] 无法获取音频 URL");
          if (errorEl) errorEl.style.display = "flex";
          player.classList.remove("loading");
        }
      } catch (error) {
        console.error("[音乐播放器] 初始化失败:", error);
        if (errorEl) errorEl.style.display = "flex";
        player.classList.remove("loading");
      }
    },
    [fetchAudioUrl, formatTime]
  );

  /**
   * 音乐播放器切换播放/暂停
   * 供 HTML 中的内联 onclick 事件调用
   */
  const handleMusicPlayerToggle = useCallback(
    async (playerId: string) => {
      const player = document.getElementById(playerId);
      if (!player) return;

      const audio = player.querySelector(".music-audio-element") as HTMLAudioElement;
      if (!audio) return;

      // 如果音频还未加载，先通过 API 获取音频链接
      if (!player.dataset.audioLoaded) {
        await initMusicPlayerData(playerId);
      }

      if (audio.paused) {
        audio.play().catch(err => console.error("[音乐播放器] 播放失败:", err));
      } else {
        audio.pause();
      }
    },
    [initMusicPlayerData]
  );

  /**
   * 音乐播放器进度条跳转
   * 供 HTML 中的内联 onclick 事件调用
   */
  const handleMusicPlayerSeek = useCallback((playerId: string, event: MouseEvent) => {
    const player = document.getElementById(playerId);
    if (!player) return;

    const audio = player.querySelector(".music-audio-element") as HTMLAudioElement;
    const progressBar = event.currentTarget as HTMLElement;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    if (audio.duration) {
      audio.currentTime = percent * audio.duration;
    }
  }, []);

  /**
   * 初始化懒加载图片
   * 使用 IntersectionObserver 实现，当图片进入视口时加载
   */
  const initLazyLoad = useCallback((container: HTMLElement) => {
    const lazyImages = container.querySelectorAll<HTMLImageElement>("img[data-src]");

    if (lazyImages.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src && img.src !== src) {
              img.src = src;
              img.removeAttribute("data-src");

              img.onload = () => {
                requestAnimationFrame(() => {
                  img.classList.add("lazy-loaded");
                });
              };

              img.onerror = () => {
                img.classList.add("lazy-loaded");
              };

              observer.unobserve(img);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    lazyImages.forEach(img => {
      observer.observe(img);
    });

    // 返回清理函数
    return () => observer.disconnect();
  }, []);

  /**
   * 初始化所有音乐播放器
   */
  const initMusicPlayers = useCallback(
    (container: HTMLElement) => {
      const musicPlayers = container.querySelectorAll(".markdown-music-player[data-music-id]");

      musicPlayers.forEach(playerEl => {
        const player = playerEl as HTMLElement;
        const audio = player.querySelector(".music-audio-element") as HTMLAudioElement;

        if (!audio || audio.dataset.eventsAttached) return;
        audio.dataset.eventsAttached = "true";

        const artworkWrapper = player.querySelector(".music-artwork-wrapper") as HTMLElement;
        const needleEl = player.querySelector(".artwork-image-needle-background") as HTMLElement;
        const playIcon = player.querySelector(".music-play-icon") as HTMLElement;
        const pauseIcon = player.querySelector(".music-pause-icon") as HTMLElement;
        const progressFill = player.querySelector(".music-progress-fill") as HTMLElement;
        const currentTimeEl = player.querySelector(".current-time") as HTMLElement;
        const durationEl = player.querySelector(".duration") as HTMLElement;

        // 音频事件监听
        audio.addEventListener("play", () => {
          if (artworkWrapper) artworkWrapper.classList.add("is-playing");
          if (needleEl) needleEl.classList.add("needle-playing");
          if (playIcon) playIcon.style.display = "none";
          if (pauseIcon) pauseIcon.style.display = "block";
        });

        audio.addEventListener("pause", () => {
          if (artworkWrapper) artworkWrapper.classList.remove("is-playing");
          if (needleEl) needleEl.classList.remove("needle-playing");
          if (playIcon) playIcon.style.display = "block";
          if (pauseIcon) pauseIcon.style.display = "none";
        });

        audio.addEventListener("timeupdate", () => {
          if (progressFill && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100 || 0;
            progressFill.style.width = progress + "%";
          }
          if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(audio.currentTime);
          }
        });

        audio.addEventListener("loadedmetadata", () => {
          if (durationEl) {
            durationEl.textContent = formatTime(audio.duration);
          }
        });

        audio.addEventListener("ended", () => {
          audio.currentTime = 0;
          if (artworkWrapper) artworkWrapper.classList.remove("is-playing");
          if (needleEl) needleEl.classList.remove("needle-playing");
        });

        // 预加载音频元数据以显示时长
        const preloadAudioMetadata = async () => {
          try {
            const musicDataAttr = player.getAttribute("data-music-data");
            if (!musicDataAttr) return;

            const decodedData = musicDataAttr
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&amp;/g, "&");

            const musicData = JSON.parse(decodedData);

            // 应用封面主色到进度条
            if (musicData.color && progressFill) {
              progressFill.style.background = musicData.color;
              console.log("[音乐播放器] 应用主色:", musicData.color);
            }

            if (!musicData.neteaseId) return;

            console.log(`[音乐播放器] 预加载元数据 - ${musicData.name || "未知歌曲"}`);

            // 调用 API 获取音频链接
            const audioUrl = await fetchAudioUrl(musicData.neteaseId);
            if (audioUrl) {
              audio.src = audioUrl;
              audio.preload = "metadata"; // 只预加载元数据，不下载整个音频
              player.dataset.audioLoaded = "true";
              console.log(`[音乐播放器] 元数据预加载完成 - ${musicData.name || "未知歌曲"}`);
            }
          } catch (error) {
            console.error("[音乐播放器] 预加载元数据失败:", error);
          }
        };

        // 异步预加载
        preloadAudioMetadata();
      });
    },
    [formatTime, fetchAudioUrl]
  );

  // 初始化所有交互
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 注册全局函数（供 HTML 内联事件使用）
    window.__markdownEditorCopyHandler = handleGlobalCodeCopy;
    window.__musicPlayerToggle = handleMusicPlayerToggle;
    window.__musicPlayerSeek = handleMusicPlayerSeek;

    // 延迟初始化，确保 DOM 已渲染
    let lazyLoadCleanup: (() => void) | undefined;
    let mermaidCleanup: (() => void) | undefined;

    const timer = setTimeout(() => {
      initCodeBlockExpand(container);
      initCodeHeadClick(container);
      initCodeCopy(container);
      initTabs(container);
      initTipHover(container);
      initHideContent(container);
      initImagePreview(container);
      initGalleryClick(container);
      initCopyWithCopyright(container);
      initMusicPlayers(container);
      lazyLoadCleanup = initLazyLoad(container);
      mermaidCleanup = initMermaidZoom(container);
    }, 100);

    return () => {
      clearTimeout(timer);
      // 清理全局函数
      delete window.__markdownEditorCopyHandler;
      delete window.__musicPlayerToggle;
      delete window.__musicPlayerSeek;
      // 清理懒加载观察器
      lazyLoadCleanup?.();
      // 清理 mermaid 缩放
      mermaidCleanup?.();
    };
  }, [
    content,
    handleGlobalCodeCopy,
    handleMusicPlayerToggle,
    handleMusicPlayerSeek,
    initCodeBlockExpand,
    initCodeHeadClick,
    initCodeCopy,
    initTabs,
    initTipHover,
    initHideContent,
    initImagePreview,
    initGalleryClick,
    initCopyWithCopyright,
    initMusicPlayers,
    initLazyLoad,
    initMermaidZoom,
  ]);

  return (
    <article ref={containerRef} className={`post-content ${className}`} dangerouslySetInnerHTML={{ __html: content }} />
  );
}

export default PostContent;
