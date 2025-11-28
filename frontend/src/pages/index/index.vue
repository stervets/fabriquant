<template>
  <div class="page page-index flex flex-col items-center h-full">
        <!-- Верхняя панель с ботами -->
        <div class="header w-full flex items-center">
          <div class="flex gap-1 items-center border-bottom pr-4" style="height: 33px">
            <div class="pl-1">
              <img src="@/public/img/FabriquantLogoColor.png" style="width: 30px;"/>
            </div>
            <div class="" style="color: white">
              Fabriquant
            </div>
          </div>
          <el-tabs type="card" v-model="application.store.selectedBotId"
                   class="bots-tabs"
                   @tab-remove="deleteBot"
          >
            <template v-for="bot in application.state.bots" :key="bot.id">
              <el-tab-pane :class="bot.type"
                           :name="bot.id"
                           :closable="application.state.bots.length > 1"
              >
                <template #label>
                  <el-icon style="font-style: normal">
                    <i class="fa-light fa-circle-pause"></i>
                  </el-icon>
                  <div class="pl-2">
                    {{bot.name}}
                  </div>
                </template>
              </el-tab-pane>
            </template>
            <!--el-tab-pane-- active label="Config" name="second">
              <template #label>
                <el-icon color="#409efc" style="font-style: normal">
                <el-icon color="#66C13A" style="font-style: normal">
                <i class="fa-thin fa-chart-candlestick"></i>
                <el-icon color="#96c681" style="font-style: normal">

                </el-icon>
                <div class="text pl-2" style="color:#96c681;">
                Config
                </div>
              </template>
            </el-tab-pane-->
          </el-tabs>
          <div class="header-left flex-grow border-bottom pl-2 flex items-center" style="height: 33px;padding-top: 1px">
            <div class="header-right">
              <el-button type="primary" size="small" plain @click="createBot">
                <i class="fa-regular fa-plus"></i>
              </el-button>
            </div>
          </div>
        </div>

        <div class="main w-full flex-grow">
          <!-- Внешний сплиттер: верх (код+график) / низ (логи) -->
          <el-splitter
              class="splitter-outer"
              layout="vertical"
          >
            <!-- Верхняя зона: редактор + график -->
            <el-splitter-panel size="75%">
              <el-splitter class="splitter-inner">
                <!-- Левая панель: Monaco -->
                <el-splitter-panel size="50%" :collapsible="true" min="150">
                  <div class="panel panel--editor">
                    <!-- сюда потом воткнёшь Monaco -->
                    <div class="panel-placeholder">
                      MONACO EDITOR
                    </div>
                  </div>
                </el-splitter-panel>

                <!-- Правая панель: Highcharts -->
                <el-splitter-panel min="150">
                  <div class="panel panel--chart">
                    <!-- сюда потом воткнёшь Highcharts -->
                    <div class="panel-placeholder">
                      HIGHCHARTS
                    </div>
                  </div>
                </el-splitter-panel>
              </el-splitter>
            </el-splitter-panel>

            <!-- Нижняя зона: логи -->
            <el-splitter-panel :collapsible="true" min="150">
              <div class="panel panel--logs">
                <!-- сюда потом воткнёшь компонент логов -->
                <div class="panel-placeholder">
                  LOGS
                </div>
              </div>
            </el-splitter-panel>
          </el-splitter>
        </div>
  </div>
</template>

<script src="./script.ts" lang="ts"/>
<style src="./style.less" lang="less" scoped/>
<style src="./style-global.less" lang="less"/>
